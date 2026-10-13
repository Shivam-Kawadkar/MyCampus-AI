import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CampusEvent, 
  PrepTask, 
  PendingDeadline, 
  UserProfile, 
  CampusNotification, 
  NavigationPage, 
  RegistrationStatus 
} from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface EventContextType {
  events: CampusEvent[];
  registeredEvents: CampusEvent[];
  tasks: PrepTask[];
  deadlines: PendingDeadline[];
  profile: UserProfile | null;
  notifications: CampusNotification[];
  unreadNotifCount: number;
  loading: boolean;
  activePage: NavigationPage;
  setActivePage: (page: NavigationPage) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedEvent: CampusEvent | null;
  openEventDetail: (event: CampusEvent) => void;
  closeEventDetail: () => void;
  isAddEventModalOpen: boolean;
  setIsAddEventModalOpen: (open: boolean) => void;
  isAddTaskModalOpen: boolean;
  setIsAddTaskModalOpen: (open: boolean) => void;
  updateEventRegistration: (eventId: string, status: RegistrationStatus) => Promise<void>;
  addNewEvent: (eventData: Omit<CampusEvent, 'id'>) => Promise<CampusEvent>;
  toggleTask: (taskId: string) => Promise<void>;
  addTask: (taskData: Omit<PrepTask, 'id'>) => Promise<PrepTask>;
  deleteTask: (taskId: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  toasts: ToastState[];
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [events, setEvents] = useState<CampusEvent[]>([]);
  const [tasks, setTasks] = useState<PrepTask[]>([]);
  const [deadlines, setDeadlines] = useState<PendingDeadline[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<CampusNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activePage, setActivePage] = useState<NavigationPage>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CampusEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const showToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setEvents([]);
      setTasks([]);
      setDeadlines([]);
      setProfile(null);
      setNotifications([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [allEvents, allTasks, allDeadlines, userProf, allNotifs] = await Promise.all([
        api.events.getAll(),
        api.tasks.getAll(),
        api.deadlines.getAll(),
        api.user.getProfile(),
        api.notifications.getAll(),
      ]);
      setEvents(allEvents);
      setTasks(allTasks);
      setDeadlines(allDeadlines);
      setProfile(userProf);
      setNotifications(allNotifs);
    } catch (err) {
      console.error('Failed to load campus data:', err);
      showToast('Error loading campus data', 'error');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, showToast]);

  useEffect(() => {
    refreshData();
  }, [refreshData, user?.id]);

  const registeredEvents = useMemo(() => {
    return events.filter(
      (e) => e.registrationStatus === 'registered' || e.registrationStatus === 'waitlisted' || e.registrationStatus === 'attended'
    );
  }, [events]);

  const unreadNotifCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const openEventDetail = useCallback((event: CampusEvent) => {
    setSelectedEvent(event);
  }, []);

  const closeEventDetail = useCallback(() => {
    setSelectedEvent(null);
  }, []);

  const updateEventRegistration = useCallback(async (eventId: string, status: RegistrationStatus) => {
    try {
      const updated = await api.events.updateStatus(eventId, status);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(updated);
      }
      const label = status === 'registered' ? 'Registered for event!' : status === 'not_registered' ? 'Registration cancelled' : `Status updated to ${status}`;
      showToast(label, 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not update event status', 'error');
    }
  }, [selectedEvent, showToast]);

  const addNewEvent = useCallback(async (eventData: Omit<CampusEvent, 'id'>) => {
    try {
      const created = await api.events.create(eventData);
      setEvents((prev) => [created, ...prev]);
      showToast(`Added "${created.title}" to events!`, 'success');
      return created;
    } catch (err) {
      console.error(err);
      showToast('Failed to add new event', 'error');
      throw err;
    }
  }, [showToast]);

  const toggleTask = useCallback(async (taskId: string) => {
    try {
      const updated = await api.tasks.toggle(taskId);
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
      showToast(updated.isCompleted ? 'Task marked complete! 🎉' : 'Task reopened', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to update task', 'error');
    }
  }, [showToast]);

  const addTask = useCallback(async (taskData: Omit<PrepTask, 'id'>) => {
    try {
      const created = await api.tasks.create(taskData);
      setTasks((prev) => [created, ...prev]);
      showToast('Preparation task added!', 'success');
      return created;
    } catch (err) {
      console.error(err);
      showToast('Failed to create task', 'error');
      throw err;
    }
  }, [showToast]);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await api.tasks.delete(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      showToast('Task removed', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to remove task', 'error');
    }
  }, [showToast]);

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      const updated = await api.user.updateProfile(updates);
      setProfile(updated);
      showToast('Profile and preferences updated successfully', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update preferences', 'error');
    }
  }, [showToast]);

  const markNotificationAsRead = useCallback(async (id: string) => {
    await api.notifications.markAsRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    await api.notifications.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('All notifications marked as read', 'info');
  }, [showToast]);

  return (
    <EventContext.Provider
      value={{
        events,
        registeredEvents,
        tasks,
        deadlines,
        profile,
        notifications,
        unreadNotifCount,
        loading,
        activePage,
        setActivePage,
        searchQuery,
        setSearchQuery,
        selectedEvent,
        openEventDetail,
        closeEventDetail,
        isAddEventModalOpen,
        setIsAddEventModalOpen,
        isAddTaskModalOpen,
        setIsAddTaskModalOpen,
        updateEventRegistration,
        addNewEvent,
        toggleTask,
        addTask,
        deleteTask,
        updateProfile,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        toasts,
        showToast,
        removeToast,
        refreshData,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvents = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvents must be used within an EventProvider');
  }
  return context;
};

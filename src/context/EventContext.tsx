import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  CampusEvent, 
  PrepTask, 
  PendingDeadline, 
  UserProfile, 
  CampusNotification, 
  NavigationPage, 
  RegistrationStatus,
  ScheduleConflict 
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
  conflicts: ScheduleConflict[];
  conflictsLoading: boolean;
  conflictsError: string | null;
  refreshConflicts: () => Promise<void>;
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
  updateEvent: (eventId: string, updates: Partial<CampusEvent>) => Promise<CampusEvent>;
  deleteEvent: (eventId: string) => Promise<boolean>;
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
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);
  const [conflictsLoading, setConflictsLoading] = useState<boolean>(false);
  const [conflictsError, setConflictsError] = useState<string | null>(null);
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

  const refreshConflicts = useCallback(async () => {
    if (!isAuthenticated) {
      setConflicts([]);
      setConflictsError(null);
      return;
    }
    try {
      setConflictsLoading(true);
      setConflictsError(null);
      const res = await api.events.getConflicts();
      setConflicts(res);
    } catch (err: any) {
      console.error('Failed to load schedule conflicts:', err);
      setConflictsError(err?.message || 'Could not evaluate schedule conflicts');
    } finally {
      setConflictsLoading(false);
    }
  }, [isAuthenticated]);

  const refreshData = useCallback(async () => {
    if (!isAuthenticated) {
      setEvents([]);
      setTasks([]);
      setDeadlines([]);
      setProfile(null);
      setNotifications([]);
      setConflicts([]);
      setConflictsError(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setConflictsError(null);
      const [allEvents, allTasks, allDeadlines, userProf, allNotifs, allConflicts] = await Promise.all([
        api.events.getAll(),
        api.tasks.getAll(),
        api.deadlines.getAll(),
        api.user.getProfile(),
        api.notifications.getAll(),
        api.events.getConflicts().catch((err) => {
          console.error('Failed to load schedule conflicts:', err);
          setConflictsError(err?.message || 'Could not load conflicts');
          return [] as ScheduleConflict[];
        }),
      ]);
      setEvents(allEvents);
      setTasks(allTasks);
      setDeadlines(allDeadlines);
      setProfile(userProf);
      setNotifications(allNotifs);
      setConflicts(allConflicts);
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
      refreshConflicts();
      const label = status === 'registered' ? 'Registered for event!' : status === 'not_registered' ? 'Registration cancelled' : `Status updated to ${status}`;
      showToast(label, 'success');
    } catch (err) {
      console.error(err);
      showToast('Could not update event status', 'error');
    }
  }, [selectedEvent, refreshConflicts, showToast]);

  const addNewEvent = useCallback(async (eventData: Omit<CampusEvent, 'id'>) => {
    try {
      const created = await api.events.create(eventData);
      setEvents((prev) => [created, ...prev]);
      refreshConflicts();
      showToast(`Added "${created.title}" to events!`, 'success');
      return created;
    } catch (err) {
      console.error(err);
      showToast('Failed to add new event', 'error');
      throw err;
    }
  }, [refreshConflicts, showToast]);

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CampusEvent>) => {
    try {
      const updated = await api.events.update(eventId, updates);
      setEvents((prev) => prev.map((e) => (e.id === eventId ? updated : e)));
      if (selectedEvent?.id === eventId) {
        setSelectedEvent(updated);
      }
      refreshConflicts();
      // Re-fetch deadlines and tasks in background in case dates changed
      Promise.all([api.deadlines.getAll(), api.tasks.getAll()]).then(([dl, tk]) => {
        setDeadlines(dl);
        setTasks(tk);
      }).catch(() => {});
      showToast(`Updated "${updated.title}" successfully!`, 'success');
      return updated;
    } catch (err: any) {
      console.error('Failed to update event:', err);
      showToast(err?.message || 'Failed to update event', 'error');
      throw err;
    }
  }, [selectedEvent, refreshConflicts, showToast]);

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      const success = await api.events.delete(eventId);
      if (success) {
        setEvents((prev) => prev.filter((e) => e.id !== eventId));
        if (selectedEvent?.id === eventId) {
          setSelectedEvent(null);
        }
        // Refresh tasks, deadlines, and conflicts since backend cascades task deletion
        const [allTasks, allDeadlines, allConflicts] = await Promise.all([
          api.tasks.getAll(),
          api.deadlines.getAll(),
          api.events.getConflicts().catch(() => [] as ScheduleConflict[]),
        ]);
        setTasks(allTasks);
        setDeadlines(allDeadlines);
        setConflicts(allConflicts);
        showToast('Event deleted successfully', 'info');
      }
      return success;
    } catch (err: any) {
      console.error('Failed to delete event:', err);
      showToast(err?.message || 'Failed to delete event', 'error');
      throw err;
    }
  }, [selectedEvent, showToast]);

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
        conflicts,
        conflictsLoading,
        conflictsError,
        refreshConflicts,
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
        updateEvent,
        deleteEvent,
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

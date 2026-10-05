"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { notificationApi } from "@/lib/api";
import { getSocket, disconnectSocket } from "@/lib/socket";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res = await notificationApi.listMine(token);
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unread);
    } catch {
      // Non-critical — notification bell just stays empty until next refresh.
    }
  }, [token]);

  useEffect(() => {
    if (!user || !token) {
      disconnectSocket();
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    refresh();

    const socket = getSocket(token);
    const onNew = (notification) => {
      setNotifications((prev) => [notification, ...prev].slice(0, 50));
      setUnreadCount((prev) => prev + 1);
    };
    socket.on("notification:new", onNew);

    return () => {
      socket.off("notification:new", onNew);
    };
  }, [user, token, refresh]);

  const markAsRead = async (id) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    setUnreadCount((prev) => Math.max(0, prev - 1));
    try {
      await notificationApi.markAsRead(id, token);
    } catch {
      refresh();
    }
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
    try {
      await notificationApi.markAllAsRead(token);
    } catch {
      refresh();
    }
  };

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, refresh }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}

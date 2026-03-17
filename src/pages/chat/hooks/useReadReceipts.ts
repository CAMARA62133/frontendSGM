import { useState, useEffect, useCallback, useRef } from "react";
import { readReceiptService } from "../services/readReceiptService";
import { useAuth } from "../../../context/useAuth";

import { useSocket } from "../contexts/useSocket";
import type { ReadReceipt } from "../types/read.receipt.type";
import type { Communication } from "../types/communication.type";

// Type pour les timeouts (compatible NodeJS et navigateur)
type Timeout = ReturnType<typeof setTimeout>;

export const useReadReceipts = (
  messages: Communication[],
  conversationId: string | null,
) => {
  const [readReceipts, setReadReceipts] = useState<
    Record<number, ReadReceipt[]>
  >({});
  const [readMessages, setReadMessages] = useState<Set<number>>(new Set());
  const { user } = useAuth();
  const { socket } = useSocket();

  // Utiliser useRef pour suivre les timeouts avec le bon type
  const timeoutsRef = useRef<Map<number, Timeout>>(new Map());

  // Fonction mémoïsée pour marquer comme lu
  const markAsRead = useCallback(async (messageId: number) => {
    try {
      const receipts = await readReceiptService.markAsRead(messageId);
      setReadReceipts((prev) => ({ ...prev, [messageId]: receipts }));
    } catch (error) {
      console.error("Erreur marquage lecture:", error);
    }
  }, []);

  // Nettoyer les timeouts au démontage
  useEffect(() => {
    const currentTimeouts = timeoutsRef.current;

    return () => {
      currentTimeouts.forEach((timeout) => clearTimeout(timeout));
      currentTimeouts.clear();
    };
  }, []);

  // Effet pour marquer automatiquement les messages comme lus
  useEffect(() => {
    if (!messages.length || !user || !conversationId) return;

    // Filtrer les messages visibles non lus
    const visibleMessages = messages.filter(
      (msg): msg is Communication & { id: number } =>
        msg.user?.id !== user.id && !!msg.id && !readMessages.has(msg.id),
    );

    // Copier la référence courante pour une utilisation dans les callbacks
    const currentTimeouts = timeoutsRef.current;

    // Nettoyer les anciens timeouts pour ces messages
    visibleMessages.forEach((msg) => {
      const existingTimeout = currentTimeouts.get(msg.id);
      if (existingTimeout) {
        clearTimeout(existingTimeout);
        currentTimeouts.delete(msg.id);
      }
    });

    // Créer de nouveaux timeouts
    visibleMessages.forEach((msg) => {
      const timeout = setTimeout(() => {
        markAsRead(msg.id);
        setReadMessages((prev) => {
          const newSet = new Set(prev);
          newSet.add(msg.id);
          return newSet;
        });
        // Utiliser la même référence pour le cleanup
        currentTimeouts.delete(msg.id);
      }, 2000);

      currentTimeouts.set(msg.id, timeout);
    });

    // Cleanup spécifique à cet effet
    return () => {
      visibleMessages.forEach((msg) => {
        const timeout = currentTimeouts.get(msg.id);
        if (timeout) {
          clearTimeout(timeout);
          currentTimeouts.delete(msg.id);
        }
      });
    };
  }, [messages, user, conversationId, markAsRead, readMessages]);

  // Effet pour les mises à jour socket
  useEffect(() => {
    if (!socket) return;

    const handleMessageRead = (data: {
      messageId: number;
      receipts: ReadReceipt[];
    }) => {
      setReadReceipts((prev) => ({ ...prev, [data.messageId]: data.receipts }));
    };

    socket.on("messageRead", handleMessageRead);

    return () => {
      socket.off("messageRead", handleMessageRead);
    };
  }, [socket]);

  return { readReceipts };
};

import { useState, useEffect, useCallback } from "react";
import { pinService } from "../services/pinService";



import { useSocket } from "../contexts/useSocket";
import type { PinnedMessage } from "../types/pin.type";

export const usePinnedMessages = (conversationId: string | null) => {
  const [pinnedMessages, setPinnedMessages] = useState<PinnedMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const { socket } = useSocket();

  const loadPinnedMessages = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const data = await pinService.getPinnedMessages(conversationId);
		setPinnedMessages(data);
    } catch (error) {
      console.error("Erreur chargement messages épinglés:", error);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const pinMessage = useCallback(
    async (messageId: number) => {
      if (!conversationId) return;
      try {
        const data = await pinService.pinMessage(messageId, conversationId);
        setPinnedMessages((prev) => [data, ...prev]);
        return data;
      } catch (error) {
        console.error("Erreur épingle:", error);
        throw error;
      }
    },
    [conversationId],
  );

  const unpinMessage = useCallback(
    async (messageId: number) => {
      if (!conversationId) return;
      try {
        await pinService.unpinMessage(messageId, conversationId);
        setPinnedMessages((prev) =>
          prev.filter((p) => p.messageId !== messageId),
        );
      } catch (error) {
        console.error("Erreur détachement:", error);
        throw error;
      }
    },
    [conversationId],
  );

  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleMessagePinned = (data: PinnedMessage) => {
      if (data.conversationId === conversationId) {
        setPinnedMessages((prev) => [data, ...prev]);
      }
    };

    const handleMessageUnpinned = (data: { messageId: number }) => {
      setPinnedMessages((prev) =>
        prev.filter((p) => p.messageId !== data.messageId),
      );
    };

    socket.on("messagePinned", handleMessagePinned);
    socket.on("messageUnpinned", handleMessageUnpinned);

    return () => {
      socket.off("messagePinned", handleMessagePinned);
      socket.off("messageUnpinned", handleMessageUnpinned);
    };
  }, [socket, conversationId]);

  useEffect(() => {
    loadPinnedMessages();
  }, [loadPinnedMessages]);

  return {
    pinnedMessages,
    loading,
    pinMessage,
    unpinMessage,
    refresh: loadPinnedMessages,
  };
};

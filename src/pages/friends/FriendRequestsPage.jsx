import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  UserCheck,
  Inbox,
  Send,
} from "lucide-react";
import {
  fetchFriendRequests,
  fetchSentFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
} from "../../store/friendSlice";
import FriendRequestCard from "../../components/friendComponents/FriendRequestCard";
import SentInvitationCard from "../../components/friendComponents/SentInvitationCard";

export default function FriendRequestsPage() {
  const dispatch = useDispatch();

  // 1. Redux State
  const {
    requests = [],
    sentRequests = [],
    requestStatus,
    sentStatus,
    actionLoadingId,
  } = useSelector((state) => state.friends);

  // 2. Local State
  const [activeTab, setActiveTab] = useState("received"); // 'received' | 'sent'
  const [actionFeedback, setActionFeedback] = useState(null);

  // 3. Fetch both received and sent requests on mount
  useEffect(() => {
    dispatch(fetchFriendRequests());
    dispatch(fetchSentFriendRequests());
  }, [dispatch]);

  // Auto-dismiss feedback message after 4s
  useEffect(() => {
    if (!actionFeedback) return;
    const timer = setTimeout(() => {
      setActionFeedback(null);
    }, 4000);
    return () => clearTimeout(timer);
  }, [actionFeedback]);

  // 4. Handle Accept Request
  const handleAccept = async (requestId, name) => {
    try {
      await dispatch(acceptFriendRequest(requestId)).unwrap();
      setActionFeedback({
        type: "success",
        message: `You accepted ${name || "the user"}'s friend request!`,
      });
    } catch (err) {
      setActionFeedback({
        type: "error",
        message: typeof err === "string" ? err : "Failed to accept request",
      });
    }
  };

  // 5. Handle Decline Request
  const handleDecline = async (requestId, name) => {
    try {
      await dispatch(rejectFriendRequest(requestId)).unwrap();
      setActionFeedback({
        type: "info",
        message: `Declined request from ${name || "user"}.`,
      });
    } catch (err) {
      setActionFeedback({
        type: "error",
        message: typeof err === "string" ? err : "Failed to decline request",
      });
    }
  };

  // 6. Handle Cancel Sent Request
  const handleCancelSent = async (requestId, name) => {
    try {
      await dispatch(cancelFriendRequest(requestId)).unwrap();
      setActionFeedback({
        type: "info",
        message: `Cancelled invitation to ${name || "user"}.`,
      });
    } catch (err) {
      setActionFeedback({
        type: "error",
        message: typeof err === "string" ? err : "Failed to cancel invitation",
      });
    }
  };

  const pendingCount = requests?.length || 0;
  const sentCount = sentRequests?.length || 0;

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-12 text-[#181d26]">
      {/* Top Heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#181d26]">
          Friend Requests
        </h1>
        <p className="mt-1 text-xs text-[#41454d]">
          {activeTab === "received"
            ? pendingCount === 0
              ? "You have no pending invitations."
              : `You have ${pendingCount} pending ${
                  pendingCount === 1 ? "invitation" : "invitations"
                } waiting for your response.`
            : sentCount === 0
              ? "You have not sent any pending invitations."
              : `You have sent ${sentCount} ${
                  sentCount === 1 ? "invitation" : "invitations"
                } awaiting response.`}
        </p>
      </div>

      {/* Segmented Control / Tabs */}
      <div className="flex items-center gap-1.5 rounded-[8px] bg-[#f8fafc] border border-[#dddddd] p-1 w-fit">
        {/* Received Requests */}
        <button
          type="button"
          onClick={() => setActiveTab("received")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "received"
              ? "bg-[#181d26] text-white shadow-xs"
              : "text-[#41454d] hover:text-[#181d26] hover:bg-[#e0e2e6]/60 border border-transparent"
          }`}
        >
          <span>Received Requests</span>

          <span
            className={`flex h-4 min-w-4 items-center justify-center rounded-[4px] px-1 text-[10px] tabular-nums font-medium ${
              activeTab === "received"
                ? "bg-white/20 text-white"
                : "bg-[#e0e2e6] text-[#41454d]"
            }`}
          >
            {pendingCount}
          </span>
        </button>

        {/* Sent Invitations */}
        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-[6px] px-3 py-1.5 text-xs font-medium transition-colors ${
            activeTab === "sent"
              ? "bg-[#181d26] text-white shadow-xs"
              : "text-[#41454d] hover:text-[#181d26] hover:bg-[#e0e2e6]/60 border border-transparent"
          }`}
        >
          <span>Sent Invitations</span>

          <span
            className={`flex h-4 min-w-4 items-center justify-center rounded-[4px] px-1 text-[10px] tabular-nums font-medium ${
              activeTab === "sent"
                ? "bg-white/20 text-white"
                : "bg-[#e0e2e6] text-[#41454d]"
            }`}
          >
            {sentCount}
          </span>
        </button>
      </div>

      {/* Notification / Feedback Banner */}
      {actionFeedback && (
        <div
          className={`flex items-center justify-between rounded-[8px] border p-3 text-xs font-normal transition-all ${
            actionFeedback.type === "success"
              ? "border-[#39bf45]/30 bg-[#006400]/10 text-[#006400]"
              : actionFeedback.type === "error"
                ? "border-[#aa2d00]/30 bg-[#aa2d00]/10 text-[#aa2d00]"
                : "border-[#dddddd] bg-[#f8fafc] text-[#41454d]"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 size={15} className="text-[#006400]" />
            ) : actionFeedback.type === "error" ? (
              <AlertCircle size={15} className="text-[#aa2d00]" />
            ) : (
              <UserCheck size={15} className="text-[#41454d]" />
            )}
            <span>{actionFeedback.message}</span>
          </div>

          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs text-[#41454d] hover:text-[#181d26] cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab: Received Requests */}
      {activeTab === "received" && (
        <div className="rounded-[12px] border border-[#dddddd] bg-white shadow-xs overflow-hidden">
          {/* Header bar inside table */}
          <div className="flex items-center justify-between border-b border-[#dddddd] bg-[#f8fafc] px-5 py-2.5">
            <span className="text-[11px] font-medium text-[#41454d]">
              Pending Invitations
            </span>
            <span className="text-[11px] font-normal text-[#41454d] tabular-nums">
              {pendingCount} {pendingCount === 1 ? "request" : "requests"}
            </span>
          </div>

          {/* Content */}
          {requestStatus === "loading" && requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#41454d]">
              <Loader2 size={22} className="animate-spin text-[#181d26]" />
              <p className="mt-2 text-xs">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#41454d]">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f8fafc] border border-[#dddddd] text-[#9297a0]">
                <Inbox size={20} />
              </div>
              <h3 className="mt-3 text-xs font-medium text-[#181d26]">
                No pending requests
              </h3>
              <p className="mt-1 text-[11px] text-[#41454d] max-w-sm">
                When other users invite you to connect, their invitations will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#dddddd]">
              {requests.map((request) => {
                const id = request._id || request.id;
                const name = request.requester?.name;
                const isLoading = actionLoadingId === id;

                return (
                  <FriendRequestCard
                    key={id}
                    request={request}
                    isLoading={isLoading}
                    onAccept={() => handleAccept(id, name)}
                    onDecline={() => handleDecline(id, name)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab: Sent Invitations */}
      {activeTab === "sent" && (
        <div className="rounded-[12px] border border-[#dddddd] bg-white shadow-xs overflow-hidden">
          {/* Header bar inside table */}
          <div className="flex items-center justify-between border-b border-[#dddddd] bg-[#f8fafc] px-5 py-2.5">
            <span className="text-[11px] font-medium text-[#41454d]">
              Sent Invitations
            </span>
            <span className="text-[11px] font-normal text-[#41454d] tabular-nums">
              {sentCount} {sentCount === 1 ? "invitation" : "invitations"}
            </span>
          </div>

          {/* Content */}
          {sentStatus === "loading" && sentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-[#41454d]">
              <Loader2 size={22} className="animate-spin text-[#181d26]" />
              <p className="mt-2 text-xs">Loading sent invitations...</p>
            </div>
          ) : sentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-[#41454d]">
              <div className="flex h-10 w-10 items-center justify-center rounded-[8px] bg-[#f8fafc] border border-[#dddddd] text-[#9297a0]">
                <Send size={18} />
              </div>
              <h3 className="mt-3 text-xs font-medium text-[#181d26]">
                No sent invitations
              </h3>
              <p className="mt-1 text-[11px] text-[#41454d] max-w-sm">
                You haven't sent any friend requests yet, or all your requests
                have been accepted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#dddddd]">
              {sentRequests.map((request) => {
                const id = request._id || request.id;
                const name = request.recipient?.name;
                const isLoading = actionLoadingId === id;

                return (
                  <SentInvitationCard
                    key={id}
                    request={request}
                    isLoading={isLoading}
                    onCancel={() => handleCancelSent(id, name)}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

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
    <div className="mx-auto max-w-5xl space-y-6 pb-12">
      {/* Top Breadcrumb & Heading */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Network / Friend Requests
        </p>
        <div className="mt-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Friend Requests
          </h1>
          <p className="mt-0.5 text-xs text-slate-500">
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
      </div>

      {/* Segmented Control / Tabs */}
      <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 w-fit">
        {/* Received Requests */}
        <button
          type="button"
          onClick={() => setActiveTab("received")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "received"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Received Requests</span>

          <span
            className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
              activeTab === "received"
                ? "bg-amber-100 text-amber-800"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {pendingCount}
          </span>
        </button>

        {/* Sent Invitations */}
        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`cursor-pointer inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all ${
            activeTab === "sent"
              ? "bg-white text-slate-900 shadow-2xs"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          <span>Sent Invitations</span>

          <span
            className={`flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${
              activeTab === "sent"
                ? "bg-indigo-100 text-indigo-700"
                : "bg-slate-200 text-slate-600"
            }`}
          >
            {sentCount}
          </span>
        </button>
      </div>

      {/* Notification / Feedback Banner */}
      {actionFeedback && (
        <div
          className={`flex items-center justify-between rounded-xl border p-3.5 text-xs font-medium transition-all ${
            actionFeedback.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : actionFeedback.type === "error"
                ? "border-red-200 bg-red-50 text-red-700"
                : "border-slate-200 bg-slate-50 text-slate-700"
          }`}
        >
          <div className="flex items-center gap-2">
            {actionFeedback.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : actionFeedback.type === "error" ? (
              <AlertCircle size={16} className="text-red-600" />
            ) : (
              <UserCheck size={16} className="text-slate-500" />
            )}
            <span>{actionFeedback.message}</span>
          </div>

          <button
            type="button"
            onClick={() => setActionFeedback(null)}
            className="text-xs opacity-60 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Tab: Received Requests */}
      {activeTab === "received" && (
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          {/* Header bar inside table */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Pending Invitations
            </span>
            <span className="text-xs font-medium text-slate-500">
              {pendingCount} {pendingCount === 1 ? "request" : "requests"}
            </span>
          </div>

          {/* Content */}
          {requestStatus === "loading" && requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
              <p className="mt-2 text-xs">Loading requests...</p>
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Inbox size={22} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                No pending requests
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                When other users invite you to connect, their invitations will
                appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
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
        <div className="rounded-2xl border border-slate-200/80 bg-white shadow-2xs overflow-hidden">
          {/* Header bar inside table */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/70 px-6 py-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Sent Invitations
            </span>
            <span className="text-xs font-medium text-slate-500">
              {sentCount} {sentCount === 1 ? "invitation" : "invitations"}
            </span>
          </div>

          {/* Content */}
          {sentStatus === "loading" && sentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <Loader2 size={24} className="animate-spin text-indigo-600" />
              <p className="mt-2 text-xs">Loading sent invitations...</p>
            </div>
          ) : sentRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-slate-400">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                <Send size={22} />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-700">
                No sent invitations
              </h3>
              <p className="mt-1 text-xs text-slate-400 max-w-sm">
                You haven't sent any friend requests yet, or all your requests
                have been accepted.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
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

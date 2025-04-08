// 🧠 utils/commentCache.js 
const STORAGE_KEY = "seenTaskComments";

export function markTaskCommentsAsSeen(taskId) {
    const seen = JSON.parse(localStorage.getItem("seen_task_comments") || "[]");
    if (!seen.includes(taskId)) {
      seen.push(taskId);
      localStorage.setItem("seen_task_comments", JSON.stringify(seen));
    }
  }
  

export function getSeenComments() {
  const stored = localStorage.getItem(STORAGE_KEY);
  return new Set(stored ? JSON.parse(stored) : []);
}

export function isTaskCommentSeen(taskId) {
    const seenComments = JSON.parse(localStorage.getItem("seen_task_comments") || "[]");
    return seenComments.includes(taskId);
  }
  

export function clearSeenTask(taskId) {
  const seen = getSeenComments();
  seen.delete(taskId.toString());
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...seen]));
}

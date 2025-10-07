import { useState } from "react";

const styles = {
  commentsSection: {
    margin: "10px 0",
  },

  comments: {
    fontSize: "12px",
    color: "#666",
    marginTop: "5px",
  },
  form: {
    width: "100%",
    marginTop: "10px",
  },
  commentsWrap: {
    marginBottom: "15px",
    padding: "10px",
    backgroundColor: "#f5f5f5",
    borderRadius: "5px",
    position: "relative",
  },
};

const CommentsSection = ({
  comments,
  getUserName,
  formatDate,
  comment,
  onCommentChange,
  onCommentDelete,
  commentChange,
  loading,
  onSubmit,
}) => {
  const [editingComment, setEditingComment] = useState(null);
  const [editedText, setEditedText] = useState("");

  const startEditing = (commentItem) => {
    setEditingComment(commentItem.id);
    setEditedText(commentItem.text || "");
  };

  const cancelEditing = () => {
    setEditingComment(null);
    setEditedText("");
  };

  const saveEditedComment = () => {
    if (editedText.trim()) {
      commentChange(editingComment, editedText);
      setEditingComment(null);
      setEditedText("");
    }
  };

  return (
    <div className="taskCard">
      <div
        className="headlineBlock"
        style={{
          borderBottom: "1px solid #e9ecef",
          marginBottom: "16px",
          paddingBottom: "12px",
        }}
      >
        <b>Комментарии</b>
      </div>

      <div style={styles.commentsSection}>
        {comments && comments.length > 0 ? (
          comments.map((commentItem, index) => (
            <div key={index} style={styles.commentsWrap}>
              {editingComment === commentItem.id ? (
                <div>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    placeholder="Введите комментарий..."
                    style={{
                      width: "100%",
                      minHeight: "80px",
                      padding: "8px",
                      borderRadius: "4px",
                      border: "1px solid #ddd",
                      resize: "vertical",
                    }}
                  />
                  <div
                    style={{ marginTop: "10px", display: "flex", gap: "10px" }}
                  >
                    <button
                      className="create-btn"
                      onClick={saveEditedComment}
                      disabled={!editedText.trim()}
                    >
                      Сохранить
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={cancelEditing}
                      style={{
                        backgroundColor: "#f5f5f5",
                        color: "#666",
                        border: "1px solid #ddd",
                      }}
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div>{commentItem.text || "Комментарий отсутствует"}</div>
                  <div style={styles.comments}>
                    <b>{getUserName(commentItem.user_id)},&nbsp;</b>
                    <b>Дата создания:&nbsp;</b>
                    {formatDate(commentItem.created_at) || "Не указано"}
                    <div
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                      }}
                    >
                      <button
                        className="crossBtn"
                        onClick={() => onCommentDelete(commentItem.id)}
                      >
                        x
                      </button>
                      <button
                        style={{ marginTop: "5px" }}
                        onClick={() => startEditing(commentItem)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          fill="var(--color-blue)"
                          viewBox="0 0 16 16"
                        >
                          <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        ) : (
          <div>Нет комментариев</div>
        )}
      </div>

      <form onSubmit={onSubmit} style={styles.form}>
        <textarea
          style={styles.form}
          type="text"
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder="Введите комментарий..."
          disabled={loading}
          required
        />
        <button
          className="create-btn"
          style={{ marginTop: "10px" }}
          disabled={loading || !comment.trim()}
          type="submit"
        >
          {loading ? "Отправка..." : "Добавить комментарий"}
        </button>
      </form>
    </div>
  );
};

export default CommentsSection;

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
  },
};

const CommentsSection = ({
  comments,
  getUserName,
  formatDate,
  comment,
  onCommentChange,
  loading,
  onSubmit,
}) => (
  <div className="taskCard">
    <div
      className="headlineBlock"
      style={{
        borderBottom: "1px solid #e9ecef",
        marginBottom: "16px",
        paddingBottom: "12px",
      }}
    >
      <b>Комментарии задачи</b>
    </div>

    <div style={styles.commentsSection}>
      {comments && comments.length > 0 ? (
        comments.map((commentItem, index) => (
          <div key={index} style={styles.commentsWrap}>
            <div>{commentItem.text || "Комментарий отсутствует"}</div>
            <div style={styles.comments}>
              <b>{getUserName(commentItem.user_id)},&nbsp;</b>
              <b>Дата создания:&nbsp;</b>
              {formatDate(commentItem.created_at) || "Не указано"}
            </div>
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

export default CommentsSection;

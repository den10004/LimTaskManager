const styles = {
  commentsSection: {
    margin: "10px 0",
  },
  commentsList: {
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
  <div style={styles.commentsSection}>
    <b>Комментарии: </b>

    <div style={styles.commentsList}>
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
        style={{ width: "250px", marginTop: "10px" }}
        disabled={loading || !comment.trim()}
        type="submit"
      >
        {loading ? "Отправка..." : "Добавить комментарий"}
      </button>
    </form>
  </div>
);

export default CommentsSection;

import PropTypes from "prop-types";

const Alert = ({ message, onConfirm, onCancel, isSuccess }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="fixed inset-0 bg-black opacity-50"></div>
      <div
        className="relative rounded-lg p-6 shadow-xl max-w-sm w-full mx-4"
        style={{ backgroundColor: "var(--secondary)" }}
      >
        <p className="text-center mb-6">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 hover:opacity-70 py-2 rounded-lg text-white"
            style={{ backgroundColor: "var(--tertiary)" }}
          >
            {isSuccess ? "OK" : "Confirm"}
          </button>
          {!isSuccess && onCancel && (
            <button
              onClick={onCancel}
              className="px-4 hover:opacity-70 py-2 text-white rounded-lg"
              style={{
                backgroundColor: "var(--quaternary)",
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  isSuccess: PropTypes.bool,
};

Alert.defaultProps = {
  isSuccess: false,
};

export default Alert;

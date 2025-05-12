import RegisterForm from "../Register.tsx";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: () => void;
}

const RegisterModal = ({ isOpen, onClose, onRegisterSuccess }: RegisterModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto bg-black bg-opacity-50">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-lg bg-white shadow-xl">
        <button
          onClick={onClose}
          className="absolute z-10 text-2xl text-gray-500 right-4 top-4 hover:text-gray-700"
        >
          &times;
        </button>
        <RegisterForm
          onSuccess={onRegisterSuccess || (() => { })}
        />
      </div>
    </div>
  );
};

export default RegisterModal;
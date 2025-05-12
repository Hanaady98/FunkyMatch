import { Textarea } from "flowbite-react";
import { HiExclamation } from "react-icons/hi";
import { UseFormRegister, FieldError } from "react-hook-form";
import { FormData } from "../Register.tsx";

// Base styles with consistent widths
const containerClasses = "mb-4 w-full max-w-2xl"; // max width for all containers
const baseInputClasses = "w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all duration-200";
const errorInputClasses = "border-red-500 focus:border-red-500 focus:ring-red-200";
const validInputClasses = "border-gray-300 focus:border-blue-500 focus:ring-blue-200";
const labelClasses = "block mb-2 font-medium text-gray-700";

interface InputProps {
  type?: string;
  label: string;
  name: string;
  register: UseFormRegister<FormData>;
  error?: FieldError;
  required?: boolean;
  className?: string;
  [key: string]: any;
}

const StyledInput = ({
  type = "text",
  label,
  name,
  register,
  error,
  required = false,
  className = "",
  ...props
}: InputProps) => {
  return (
    <div className={`${containerClasses} ${className}`}>
      <label htmlFor={name} className={labelClasses}>
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <input
        id={name}
        type={type}
        {...register(name as any)}
        className={`${baseInputClasses} ${error ? errorInputClasses : validInputClasses}`}
        {...props}
      />
      {error && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <HiExclamation className="flex-shrink-0 mr-1" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

interface TextAreaProps {
  label: string;
  name: string;
  register: UseFormRegister<FormData>;
  error?: FieldError;
  required?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  maxLength?: number;
  currentLength?: number;
  className?: string;
}

const StyledTextarea = ({
  label,
  name,
  register,
  error,
  required = false,
  value,
  onChange,
  maxLength,
  currentLength,
  className = "",
}: TextAreaProps) => {
  return (
    <div className={`${containerClasses} ${className}`}>
      <label htmlFor={name} className={labelClasses}>
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <Textarea
        id={name}
        {...register(name as any)}
        value={value}
        onChange={onChange}
        rows={4}
        className={`${baseInputClasses} ${error ? errorInputClasses : validInputClasses} resize-none`}
      />
      <div className="flex justify-between mt-1">
        {error ? (
          <div className="flex items-center text-sm text-red-600">
            <HiExclamation className="flex-shrink-0 mr-1" />
            <span>{error.message}</span>
          </div>
        ) : (
          <div></div>
        )}
        {maxLength && (
          <div className="text-sm text-gray-500">
            {currentLength || 0}/{maxLength}
          </div>
        )}
      </div>
    </div>
  );
};

interface RadioGroupProps {
  label: string;
  name: string;
  register: UseFormRegister<FormData>;
  error?: FieldError;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

const StyledRadioGroup = ({
  label,
  name,
  register,
  error,
  options,
  required = false,
  className = "",
}: RadioGroupProps) => {
  return (
    <div className={`${containerClasses} ${className}`}>
      <label className={labelClasses}>
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              {...register(name as any)}
              value={option.value}
              className="w-5 h-5 text-blue-600 border-gray-300 focus:ring-blue-300"
            />
            <span className="text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
      {error && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <HiExclamation className="flex-shrink-0 mr-1" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

interface FileUploadProps {
  label: string;
  name: string;
  error?: FieldError;
  required?: boolean;
  onChange: (url: string) => void;
  currentImage?: string;
}

const StyledFileUpload = ({
  label,
  name,
  error,
  required = false,
  onChange,
  currentImage,
}: FileUploadProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      onChange(url);
    }
  };

  return (
    <div className={`${containerClasses}`}>
      <label className={labelClasses}>
        {label}{required && <span className="text-red-500">*</span>}
      </label>
      <div className="flex items-center w-full gap-4">
        {currentImage && (
          <div className="flex-shrink-0 w-20 h-20 overflow-hidden border-2 border-gray-300 rounded-full">
            <img
              src={currentImage}
              alt="Preview"
              className="object-cover w-full h-full"
            />
          </div>
        )}
        <label className="w-full cursor-pointer">
          <div className={`px-4 py-3 rounded-lg border-2 ${error ? 'border-red-500' : 'border-gray-300'} hover:border-blue-500 transition-colors duration-200 w-full text-center`}>
            Choose File
          </div>
          <input
            type="file"
            id={name}
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      </div>
      {error && (
        <div className="flex items-center mt-2 text-sm text-red-600">
          <HiExclamation className="flex-shrink-0 mr-1" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  );
};

export { StyledInput, StyledTextarea, StyledRadioGroup, StyledFileUpload };
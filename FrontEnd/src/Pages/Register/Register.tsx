import { useForm } from "react-hook-form";
import { joiResolver } from "@hookform/resolvers/joi";
import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import PersonalDetailsStep from "./Steps/PersonalDetailsStep.tsx";
import AccountDetailsStep from "./Steps/AccountDetailsStep.tsx";
import AddressStep from "./Steps/AddressStep.tsx";
import HobbiesStep from "./Steps/HobbiesStep.tsx";
import AvatarStep from "./Steps/AvatarStep.tsx";
import ReviewStep from "./Steps/ReviewStep.tsx";
import { Button } from "flowbite-react";
import RegisterSchema from "../../Validations/RegisterSchema.ts";

export interface FormData {
  username: string;
  name: { first: string; last: string };
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: Date | string;
  gender: string;
  profileImage: { url: string; alt: string };
  address: { country: string; city: string; street: string };
  hobbies: string[];
  bio: string;
}

interface RegisterFormProps {
  onSuccess: () => void;
}

const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [editField, setEditField] = useState<string | null>(null);

  const form = useForm<FormData>({
    defaultValues: {
      name: { first: "", last: "" },
      email: "",
      password: "",
      confirmPassword: "",
      birthDate: "",
      gender: "",
      profileImage: { url: "", alt: "" },
      address: { country: "", city: "", street: "" },
      hobbies: [],
      bio: "",
    },
    mode: "onChange",
    resolver: joiResolver(RegisterSchema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await axios.post("http://localhost:8181/users/register", {
        ...data,
        birthDate: data.birthDate instanceof Date
          ? data.birthDate.toISOString()
          : data.birthDate,
      });

      Swal.fire({
        title: "Success!",
        text: "Registration successful",
        icon: "success",
        timer: 2000,
      });
      onSuccess();
    } catch (error) {
      let errorMessage = "Registration failed";
      if (axios.isAxiosError(error) && error.response?.data) {
        const responseData = error.response.data as {
          errorType?: string;
          message?: string;
        };
        errorMessage = responseData.errorType === "EMAIL_EXISTS"
          ? "Email already exists"
          : responseData.message || errorMessage;
      }
      Swal.fire({
        title: "Error!",
        text: errorMessage,
        icon: "error",
        timer: 2000,
      });
    }
  };

  const nextStep = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    let isValid = false;

    if (currentStep === 1) {
      isValid = await form.trigger(["name.first", "name.last", "birthDate", "gender"]);
    } else if (currentStep === 2) {
      isValid = await form.trigger(["email", "password", "confirmPassword"]);
    } else if (currentStep === 3) {
      isValid = await form.trigger(["address.country", "address.city", "address.street"]);
    } else if (currentStep === 4) {
      isValid = await form.trigger(["hobbies"]);
    } else if (currentStep === 5) {
      isValid = await form.trigger(["profileImage.url", "bio"]);
    }

    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 6));
    } else {
      Swal.fire({
        title: "Validation Error",
        text: "Please correct the errors in the form.",
        icon: "error",
      });
    }
  };

  const prevStep = (e?: React.MouseEvent) => {
    e?.preventDefault();
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleEditStart = (fieldGroup?: string) => {
    setIsEditing(true);
    setEditField(fieldGroup || null);

    if (fieldGroup) {
      const stepMap: Record<string, number> = {
        personal: 1,
        account: 2,
        address: 3,
        hobbies: 4,
        avatar: 5,
      };
      setCurrentStep(stepMap[fieldGroup] || 1);
    }
  };

  useEffect(() => {
    if (isEditing && editField) {
      const element = document.getElementById(editField);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 300);
      }
    }
  }, [isEditing, editField, currentStep]);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-lg md:flex-row">
      <div className="p-3 border-b border-gray-200 md:hidden bg-gray-50">
        <div className="flex pb-2 space-x-4 overflow-x-auto scrollbar-hide">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <button
              key={step}
              onClick={() => !isEditing && setCurrentStep(step)}
              className={`flex flex-col items-center flex-shrink-0 ${currentStep === step ? 'scale-105 font-bold' : 'opacity-80'}`}
            >
              <div className={`size-8 rounded-full flex items-center justify-center text-sm
                ${currentStep === step ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                  : currentStep > step ? 'bg-blue-400 text-white'
                    : 'bg-gray-200'}`}>
                {step}
              </div>
              <span className="mt-1 text-xs whitespace-nowrap">
                {step === 1 && "Personal"}
                {step === 2 && "Account"}
                {step === 3 && "Address"}
                {step === 4 && "Hobbies"}
                {step === 5 && "Avatar"}
                {step === 6 && "Review"}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:flex md:flex-col md:items-center md:w-1/4 md:p-4 md:overflow-y-auto md:border-r md:border-gray-200 md:bg-gray-50">
        {isEditing && (
          <div className="p-2 mb-4 text-sm text-yellow-800 bg-yellow-100 rounded-md">
            ✏️ You are in edit mode
          </div>
        )}
        <div className="flex flex-col">
          {[1, 2, 3, 4, 5, 6].map((step) => (
            <div key={step} className="flex items-start mb-4">
              <div className="flex flex-col items-center mr-3">
                <div
                  className={`size-6 shrink-0 rounded-full ${currentStep >= step ? "bg-blue-600 text-white" : "bg-gray-200"} flex items-center justify-center text-xs`}
                >
                  {step}
                </div>
                {step < 6 && (
                  <div
                    className={`h-6 border-l-2 ${currentStep > step ? "border-blue-600" : "border-gray-300"} mt-1`}
                  ></div>
                )}
              </div>
              <div
                className={`flex-1 ${currentStep === step ? "font-semibold text-blue-600" : "text-gray-700"}`}
              >
                <div className="text-xs">
                  {step === 1 && "Personal"}
                  {step === 2 && "Account"}
                  {step === 3 && "Address"}
                  {step === 4 && "Hobbies"}
                  {step === 5 && "Avatar"}
                  {step === 6 && "Review"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col w-full p-4 overflow-y-auto md:w-3/4" style={{ maxHeight: "80vh" }}>
        <div className="flex-grow pb-4">
          {currentStep === 6 ? (
            <div className="space-y-4">
              <ReviewStep
                form={form}
                onSubmit={onSubmit}
                onEdit={handleEditStart}
                isEditing={isEditing}
              />
              <div className="flex flex-col mt-4 space-y-3">
                <Button
                  type="submit"
                  onClick={form.handleSubmit(onSubmit)}
                  size="sm"
                  className={`w-full ${isEditing ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                >
                  {isEditing ? 'Save Changes' : 'Submit Registration'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              {isEditing && (
                <div className="flex items-center justify-between p-3 mb-4 text-blue-800 rounded-md bg-blue-50">
                  <span>✏️ Editing your information</span>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditField(null);
                      setCurrentStep(6);
                    }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    Finish Editing
                  </button>
                </div>
              )}
              <div className="pb-4">
                {currentStep === 1 && <PersonalDetailsStep form={form} />}
                {currentStep === 2 && <AccountDetailsStep form={form} />}
                {currentStep === 3 && <AddressStep form={form} />}
                {currentStep === 4 && <HobbiesStep form={form} />}
                {currentStep === 5 && <AvatarStep form={form} />}
              </div>
            </>
          )}
        </div>

        {currentStep < 6 && (
          <div className="flex justify-between pt-4 border-t border-gray-200">
            <Button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              size="sm"
              className={`${currentStep === 1 ? "cursor-not-allowed bg-gray-300" : "bg-gray-300 hover:bg-gray-400"} text-gray-800`}
            >
              Previous
            </Button>
            <Button
              type="button"
              onClick={nextStep}
              size="sm"
              className="text-white bg-blue-600 hover:bg-blue-700"
            >
              {currentStep === 5 ? "Review" : "Next"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
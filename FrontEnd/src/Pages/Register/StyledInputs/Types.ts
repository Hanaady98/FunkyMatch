import { UseFormReturn } from "react-hook-form";
import { FormData } from "../Register.tsx";

export interface StepProps {
  form: UseFormReturn<FormData>;
}

export interface ReviewStepProps extends StepProps {
  onSubmit: (data: FormData) => Promise<void>;
  onEdit: (fieldGroup?: string) => void;
  isEditing: boolean;
}

export interface Country {
  name: {
    common: string;
  };
  flags: {
    png: string;
    svg: string;
  };
  cca2: string;
}
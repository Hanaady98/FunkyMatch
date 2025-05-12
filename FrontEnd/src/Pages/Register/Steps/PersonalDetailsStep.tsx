import { StyledInput, StyledRadioGroup } from "../StyledInputs/StyledInputs.tsx";
import { StepProps } from "../StyledInputs/Types.ts";

const PersonalDetailsStep = ({ form }: StepProps) => {
  const { register, formState: { errors }, } = form;

  return (
    <>
      <h2 className="text-xl font-semibold">Personal Details</h2>
      <div className="flex gap-3">
        <StyledInput
          label="First Name"
          name="name.first"
          register={register}
          error={errors.name?.first}
          required
        />
        <StyledInput
          label="Last Name"
          name="name.last"
          register={register}
          error={errors.name?.last}
          required
        />
      </div>

      <StyledInput
        label="Birth Date"
        name="birthDate"
        type="date"
        register={register}
        error={errors.birthDate}
        className="mt-4"
        required
      />

      <StyledRadioGroup
        label="Gender"
        name="gender"
        register={register}
        error={errors.gender}
        options={[
          { value: "Male", label: "Male" },
          { value: "Female", label: "Female" },
        ]}
        required
      />
    </>
  );
};

export default PersonalDetailsStep;
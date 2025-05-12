import { StyledInput } from "../StyledInputs/StyledInputs.tsx";
import { StepProps } from "../StyledInputs/Types.ts";

const AccountDetailsStep = ({ form }: StepProps) => {
  const {
    register,
    formState: { errors },
  } = form;

  return (
    <>
      <h2 className="text-xl font-semibold">Account Details</h2>
      <StyledInput
        label="Username"
        name="username"
        register={register}
        error={errors.username}
        required
      />
      <StyledInput
        label="Email"
        name="email"
        type="email"
        register={register}
        error={errors.email}
        required
      />
      <div className="flex gap-3 mt-4">
        <StyledInput
          label="Password"
          name="password"
          type="password"
          register={register}
          error={errors.password}
          required
        />
        <StyledInput
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          register={register}
          error={errors.confirmPassword}
          required
        />
      </div>
    </>
  );
};

export default AccountDetailsStep;
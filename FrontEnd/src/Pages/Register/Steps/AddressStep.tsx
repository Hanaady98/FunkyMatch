import { StepProps } from "../StyledInputs/Types";
import CountrySelect from "../CountrySelect/CountrySelect.tsx";
import { StyledInput } from "../StyledInputs/StyledInputs";

const AddressStep = ({ form }: StepProps) => {
  const {
    register,
    formState: { errors, isSubmitting },
    setValue,
    watch,
    trigger
  } = form;

  const country = watch("address.country");

  const handleCountryChange = async (value: string) => {
    setValue("address.country", value);
    await trigger("address.country");
  };

  return (
    <>
      <h2 className="mb-4 text-xl font-semibold">Address</h2>
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          Country <span className="text-red-500">*</span>
        </label>
        <CountrySelect
          value={country}
          onChange={handleCountryChange}
          disabled={isSubmitting}
        />
        {errors.address?.country && (
          <div className="mt-1 text-sm text-red-600">
            {errors.address.country.message}
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <StyledInput
          label="City"
          name="address.city"
          register={register}
          error={errors.address?.city}
          disabled={isSubmitting}
          required
        />
        <StyledInput
          label="Street"
          name="address.street"
          register={register}
          error={errors.address?.street}
          disabled={isSubmitting}
          required
        />
      </div>
    </>
  );
};

export default AddressStep;
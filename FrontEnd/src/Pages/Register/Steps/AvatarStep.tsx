import { StyledTextarea } from "../StyledInputs/StyledInputs.tsx";
import { StepProps } from "../StyledInputs/Types.ts";
import ImageUploader from "../ImageUploader/ImageUploader.tsx";
import { useState, useEffect } from "react";

const AvatarStep = ({ form }: StepProps) => {
  const { register, formState: { errors }, watch, setValue, } = form;
  const [bioLength, setBioLength] = useState(0);
  const maxBioLength = 100;

  const bioValue = watch("bio");
  const imageUrl = watch("profileImage.url");

  useEffect(() => {
    setBioLength(bioValue?.length || 0);
  }, [bioValue]);

  const handleBioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxBioLength) {
      setValue("bio", value, { shouldValidate: true });
    }
  };

  const handleImageUpload = (url: string) => {
    setValue("profileImage.url", url, { shouldValidate: true });
    setValue("profileImage.alt", "User profile image", {
      shouldValidate: true,
    });
  };

  return (
    <>
      <h2 className="text-xl font-semibold">Profile Picture</h2>

      <div className="flex flex-col items-center mb-6">
        <ImageUploader
          onUploadSuccess={handleImageUpload}
          currentImage={imageUrl}
        />
        {errors.profileImage?.url && (
          <span className="mt-2 text-sm text-red-600">
            {errors.profileImage.url.message}
          </span>
        )}
      </div>

      <StyledTextarea
        label="Bio"
        name="bio"
        register={register}
        error={errors.bio}
        required
        value={bioValue || ""}
        onChange={handleBioChange}
        maxLength={maxBioLength}
        currentLength={bioLength}
      />
    </>
  );
};

export default AvatarStep;
import { Label } from "flowbite-react";
import { StepProps } from "../StyledInputs/Types.ts";

const hobbiesList = [
  "Reading",
  "Traveling",
  "Photography",
  "Gaming",
  "Cooking",
  "Fitness",
  "Music",
  "Writing",
  "Art",
  "Sports",
  "Technology",
  "Design",
  "Coding",
  "Yoga",
  "Dancing",
];

const HobbiesStep = ({ form }: StepProps) => {
  const { setValue, watch, formState: { errors }, } = form;
  const currentHobbies = watch("hobbies") || [];

  const handleHobbyChange = (hobby: string) => {
    if (currentHobbies.includes(hobby)) {
      setValue(
        "hobbies",
        currentHobbies.filter((h) => h !== hobby),
        { shouldValidate: true }
      );
    } else {
      if (currentHobbies.length < 5) {
        setValue("hobbies", [...currentHobbies, hobby], {
          shouldValidate: true,
        });
      }
    }
  };

  return (
    <>
      <h2 className="text-xl font-semibold">Hobbies</h2>
      <div className="space-y-2">
        <Label className="text-lg font-bold">
          Select Hobbies (1-5 required)
        </Label>
        <div className="flex flex-wrap gap-2">
          {hobbiesList.map((hobby) => (
            <button
              key={hobby}
              type="button"
              onClick={() => handleHobbyChange(hobby)}
              disabled={
                !currentHobbies.includes(hobby) && currentHobbies.length >= 5
              }
              className={`rounded-full px-4 py-2 ${currentHobbies.includes(hobby)
                ? "bg-blue-500 text-white"
                : "bg-gray-200 hover:bg-gray-300"
                } ${!currentHobbies.includes(hobby) && currentHobbies.length >= 5
                  ? "cursor-not-allowed opacity-50"
                  : ""
                }`}
            >
              {hobby}
            </button>
          ))}
        </div>
        <div className="text-sm text-gray-600">
          Selected: {currentHobbies.length}/5
        </div>
        {errors.hobbies && (
          <span className="text-sm text-red-600">{errors.hobbies.message}</span>
        )}
      </div>
    </>
  );
};

export default HobbiesStep;
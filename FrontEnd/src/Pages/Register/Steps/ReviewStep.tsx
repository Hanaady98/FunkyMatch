import { Alert } from "flowbite-react";
import { HiInformationCircle, HiExclamation } from "react-icons/hi";
import { ReviewStepProps } from "../StyledInputs/Types.ts";

const ReviewStep = ({ form, onEdit, isEditing, }: ReviewStepProps) => {
  const { watch, formState: { errors }, } = form;
  const formValues = watch();

  const fieldGroups = [
    {
      id: "personal",
      title: "Personal Details",
      fields: [
        {
          label: "First Name",
          value: formValues.name?.first,
          error: errors.name?.first,
        },
        {
          label: "Last Name",
          value: formValues.name?.last,
          error: errors.name?.last,
        },
        {
          label: "Birth Date",
          value: formValues.birthDate?.toString(),
          error: errors.birthDate,
        },
        { label: "Gender", value: formValues.gender, error: errors.gender },
      ],
    },
    {
      id: "account",
      title: "Account Details",
      fields: [
        { label: "Email", value: formValues.email, error: errors.email },
        { label: "Password", value: "••••••••", error: errors.password },
      ],
    },
    {
      id: "address",
      title: "Address",
      fields: [
        {
          label: "Country",
          value: formValues.address?.country,
          error: errors.address?.country,
        },
        {
          label: "City",
          value: formValues.address?.city,
          error: errors.address?.city,
        },
        {
          label: "Street",
          value: formValues.address?.street,
          error: errors.address?.street,
        },
      ],
    },
    {
      id: "hobbies",
      title: "Hobbies",
      fields: [
        {
          label: "Hobbies",
          value: formValues.hobbies?.join(", "),
          error: errors.hobbies,
        },
      ],
    },
    {
      id: "avatar",
      title: "Profile",
      fields: [
        { label: "Bio", value: formValues.bio, error: errors.bio },
        {
          label: "Profile Image",
          value: formValues.profileImage?.url ? (
            <img
              src={formValues.profileImage.url}
              alt={formValues.profileImage.alt || "Profile image"}
              className="object-cover rounded-full size-20"
            />
          ) : (
            "No avatar image provided"
          ),
          error: errors.profileImage?.url,
        },
      ],
    },
  ];

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">
        {isEditing ? "Edit Your Information" : "Review Your Registration"}
      </h2>

      {hasErrors && (
        <Alert color="failure" icon={HiExclamation} className="mb-4">
          <div>
            <h3 className="font-bold">There are errors in your form</h3>
            <div className="text-sm">
              Please fix the highlighted fields before submitting
            </div>
          </div>
        </Alert>
      )}

      <div
        className="p-4 space-y-6 overflow-y-auto rounded-lg bg-gray-50"
        style={{ maxHeight: "60vh" }}
      >
        {fieldGroups.map((group) => (
          <div
            key={group.id}
            id={group.id}
            className={`rounded-md p-4 shadow-sm ${group.fields.some((f) => f.error)
              ? "border border-red-200 bg-red-50"
              : "bg-white"
              }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold">{group.title}</h3>
              {!isEditing && (
                <button
                  type="button"
                  onClick={() => onEdit(group.id)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {group.fields.map((field, index) => (
                <div
                  key={index}
                  className={field.error ? "text-red-600" : ""}
                >
                  <span
                    className={`font-semibold ${field.error ? "text-red-600" : ""
                      }`}
                  >
                    {field.label}:
                  </span>{" "}
                  <span className={!field.value ? "text-gray-400" : ""}>
                    {field.value || "Not provided"}
                  </span>
                  {field.error && (
                    <div className="flex items-center mt-1 text-sm text-red-600">
                      <HiInformationCircle className="mr-1" />
                      <span>{field.error.message}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReviewStep;
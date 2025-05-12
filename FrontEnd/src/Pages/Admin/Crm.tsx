import { useEffect, useState } from "react";
import { TUser } from "../../Types/TUser";
import axios from "axios";
import Swal from "sweetalert2";
import { Button, Card, Pagination, Spinner } from "flowbite-react";
import { useSelector } from "react-redux";
import { TRootState } from "../../Store/BigPie";
import UsePagination from "../../Hooks/usePagination.ts";
import BanUserModal from "./Modals/BanUserModal.tsx";

const Crm = () => {
  const [users, setUsers] = useState<TUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<TUser | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(true);
  const [showBanModal, setShowBanModal] = useState(false);
  const [userToBan, setUserToBan] = useState<{
    id: string;
    username: string;
  } | null>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const searchWord = useSelector(
    (state: TRootState) => state.SearchSlice.search,
  );

  const searchUsers = () => {
    const searchParts = searchWord.toLowerCase().split(" ");
    return users.filter((item: TUser) => {
      const fullName = `${item.name.first} ${item.name.last}`.toLowerCase();
      return (
        searchParts.every((part) => fullName.includes(part)) ||
        item.username.includes(searchWord) ||
        item.email.includes(searchWord)
      );
    });
  };

  const { onPageChange, currentInUse, totalPages, currentPage } =
    UsePagination(searchUsers);

  const getAllUsers = async () => {
    try {
      setLoading(true);
      axios.defaults.headers.common["x-auth-token"] =
        localStorage.getItem("token");
      const response = await axios.get("http://localhost:8181/users");
      setUsers(response.data);
    } catch (error) {
      Swal.fire({
        title: "Failed!",
        icon: "error",
        timer: 2000,
        showCloseButton: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBanClick = (user: TUser) => {
    setUserToBan({ id: user._id, username: user.username });
    setShowBanModal(true);
  };

  const handleUnbanUser = async (userId: string) => {
    const result = await Swal.fire({
      title: "Unban this user?",
      text: "This will allow them to log in again",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      background: "#6d6d6d",
      color: "#ffffff",
      confirmButtonText: "Unban",
    });

    if (result.isConfirmed) {
      try {
        axios.defaults.headers.common["x-auth-token"] =
          localStorage.getItem("token");
        await axios.delete(`http://localhost:8181/users/admin/ban/${userId}`);

        Swal.fire({
          title: "User Unbanned!",
          icon: "success",
          timer: 2000,
          background: "#6d6d6d",
          color: "#ffffff",
        });

        getAllUsers();
        if (selectedUser?._id === userId) {
          setSelectedUser(null);
        }
      } catch (error) {
        Swal.fire({
          title: "Unban Failed!",
          icon: "error",
          timer: 2000,
          background: "#6d6d6d",
          color: "#ffffff",
        });
      }
    }
  };

  const editAuthLevel = async (user: TUser) => {
    try {
      let newRole = "";
      let buttons: { text: string; value: string }[] = [];

      if (user.isAdmin) {
        buttons = [
          { text: "Personal", value: "Personal" },
          { text: "Moderator", value: "Moderator" },
        ];
      } else if (user.isModerator) {
        buttons = [
          { text: "Personal", value: "Personal" },
          { text: "Admin", value: "Admin" },
        ];
      } else {
        buttons = [
          { text: "Moderator", value: "Moderator" },
          { text: "Admin", value: "Admin" },
        ];
      }

      const { value: role } = await Swal.fire({
        title: "Select new role",
        html: buttons
          .map(
            (button) =>
              `<button id="btn-${button.value}" class="swal2-confirm swal2-styled" style="margin: 5px; background-color: #4f46e5;">${button.text}</button>`,
          )
          .join(""),
        showCancelButton: false,
        showConfirmButton: false,
        background: "#6d6d6d",
        color: "#ffffff",
        didOpen: () => {
          buttons.forEach((button) => {
            const btn = document.getElementById(`btn-${button.value}`);
            if (btn) {
              btn.addEventListener("click", () => {
                Swal.clickConfirm();
                Swal.getConfirmButton()?.setAttribute(
                  "data-value",
                  button.value,
                );
              });
            }
          });
        },
        preConfirm: () => {
          const confirmButton = Swal.getConfirmButton();
          if (confirmButton) {
            return confirmButton.getAttribute("data-value");
          }
          return null;
        },
      });

      if (role) newRole = role;

      if (newRole) {
        const result = await Swal.fire({
          title: `Change role to ${newRole}?`,
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#4f46e5",
          cancelButtonColor: "#d33",
          background: "#6d6d6d",
          color: "#ffffff",
          confirmButtonText: "Confirm",
        });

        if (result.isConfirmed) {
          axios.defaults.headers.common["x-auth-token"] =
            localStorage.getItem("token");
          const response = await axios.patch(
            `http://localhost:8181/users/${user._id}`,
            { role: newRole },
          );

          if (response.data.user) {
            setUsers(
              users.map((u) =>
                u._id === response.data.user._id ? response.data.user : u,
              ),
            );

            if (selectedUser && selectedUser._id === response.data.user._id) {
              setSelectedUser(response.data.user);
            }

            Swal.fire({
              title: "Role updated successfully!",
              icon: "success",
              timer: 2000,
              background: "#6d6d6d",
              color: "#ffffff",
              showConfirmButton: false,
            });
          }
        }
      }
    } catch (error) {
      console.error("Update error:", error);
      Swal.fire({
        title: "Update failed!",
        icon: "error",
        timer: 2000,
        background: "#6d6d6d",
        color: "#ffffff",
        showCloseButton: true,
      });
    }
  };

  const deleteUser = async (user: TUser) => {
    try {
      const result = await Swal.fire({
        title: "Delete this user?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#4f46e5",
        cancelButtonColor: "#d33",
        background: "#6d6d6d",
        color: "#ffffff",
        confirmButtonText: "Delete",
      });
      if (result.isConfirmed) {
        axios.defaults.headers.common["x-auth-token"] =
          localStorage.getItem("token");
        await axios.delete(`http://localhost:8181/users/${user._id}`);
        setUsers(users.filter((item) => item._id !== user._id));
        setSelectedUser(null);
        Swal.fire({
          title: "User deleted!",
          icon: "success",
          timer: 2000,
          background: "#6d6d6d",
          color: "#ffffff",
          showConfirmButton: false,
        });
      }
    } catch (error) {
      Swal.fire({
        title: "Deletion failed!",
        icon: "error",
        timer: 2000,
        showCloseButton: true,
      });
    }
  };

  useEffect(() => {
    getAllUsers();
  }, []);

  return (
    <div className="flex min-h-screen flex-col px-4 pt-20">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-600">
            Client Relations Management
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Click a record to view details
          </p>
        </div>

        <main className="overflow-hidden rounded-xl bg-white shadow-md dark:bg-gray-800">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Spinner size="xl" className="mb-4" />
              <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Loading users...
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-indigo-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Username
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                  {currentInUse.map((item: TUser) => (
                    <tr
                      key={item._id}
                      className={`cursor-pointer transition-colors hover:bg-indigo-50 dark:hover:bg-gray-700 ${selectedUser?._id === item._id ? "bg-indigo-100 dark:bg-gray-600" : ""}`}
                      onClick={() => setSelectedUser(item)}
                    >
                      <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                        {item.name.first + " " + item.name.last}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {item.username}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        {item.email}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 
                                                    ${
                                                      item.isAdmin
                                                        ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                                        : item.isModerator
                                                          ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                                          : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                                    }`}
                        >
                          {item.isAdmin
                            ? "Admin"
                            : item.isModerator
                              ? "Moderator"
                              : "Personal"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            item.isBanned
                              ? handleUnbanUser(item._id)
                              : handleBanClick(item);
                          }}
                          className={`rounded-md px-2 py-1 text-sm font-medium 
                                                        ${
                                                          item.isBanned
                                                            ? "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-900 dark:text-red-200 dark:hover:bg-red-800"
                                                            : "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:hover:bg-yellow-800"
                                                        }`}
                          title={item.isBanned ? "Unban User" : "Ban User"}
                        >
                          {item.isBanned ? "Banned" : "Active"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>

        {selectedUser && (
          <div className="mx-auto mt-8 w-full max-w-md">
            <Card className="bg-gradient-to-r from-indigo-50 to-indigo-100 shadow-lg dark:from-gray-700 dark:to-gray-800">
              <div className="text-center">
                <h2 className="mb-2 text-xl font-bold text-gray-800 dark:text-white">
                  {selectedUser.name.first + " " + selectedUser.name.last}
                </h2>
                <div className="space-y-2 text-gray-600 dark:text-gray-300">
                  <p>@{selectedUser.username}</p>
                  <p>{selectedUser.email}</p>
                  <p
                    className={`inline-block rounded-full px-3 py-1 text-sm font-semibold 
                                        ${
                                          selectedUser.isAdmin
                                            ? "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                                            : selectedUser.isModerator
                                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                        }`}
                  >
                    {selectedUser.isAdmin
                      ? "Admin"
                      : selectedUser.isModerator
                        ? "Moderator"
                        : "Personal"}
                  </p>
                  {selectedUser.isBanned && (
                    <p className="inline-block rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-800 dark:bg-red-900 dark:text-red-200">
                      Banned
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-4 flex flex-wrap justify-center gap-3">
                <Button
                  gradientMonochrome="purple"
                  onClick={() => editAuthLevel(selectedUser)}
                  className="min-w-[120px] flex-1"
                >
                  Edit Role
                </Button>
                <Button
                  gradientMonochrome="failure"
                  onClick={() => deleteUser(selectedUser)}
                  className="min-w-[120px] flex-1"
                >
                  Delete
                </Button>
              </div>
            </Card>
          </div>
        )}

        {userToBan && (
          <BanUserModal
            userId={userToBan.id}
            username={userToBan.username}
            show={showBanModal}
            onClose={() => setShowBanModal(false)}
            onBanSuccess={() => {
              getAllUsers();
              setSelectedUser(null);
            }}
          />
        )}

        <div className="mt-6 flex justify-center pb-8">
          {isMobile ? (
            <div className="flex gap-2">
              <Button
                color="gray"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <Button
                color="gray"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          ) : (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              showIcons
              theme={{
                pages: {
                  selector: {
                    active: "bg-indigo-600 text-white",
                    base: "text-gray-500 hover:bg-indigo-100 dark:text-gray-300 dark:hover:bg-gray-700",
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Crm;

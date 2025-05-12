import { useState } from "react";
import { Button, Modal, Select, TextInput } from "flowbite-react";
import axios from "axios";
import Swal from "sweetalert2";

interface BanUserModalProps {
    userId: string;
    username: string;
    show: boolean;
    onClose: () => void;
    onBanSuccess: () => void;
}

const BanUserModal = ({ userId, username, show, onClose, onBanSuccess }: BanUserModalProps) => {
    const [duration, setDuration] = useState("24h");
    const [reason, setReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const handleBanUser = async () => {
        try {
            setIsProcessing(true);
            const token = localStorage.getItem("token");

            await axios.post(
                "http://localhost:8181/users/admin/ban",
                { userId, duration, reason },
                { headers: { "x-auth-token": token } }
            );

            Swal.fire({
                title: "User Banned!",
                text: `${username} has been banned for ${duration}`,
                icon: "success",
                timer: 2000,
                background: '#6d6d6d',
                color: '#ffffff'
            });

            onBanSuccess();
            onClose();
        } catch (error) {
            Swal.fire({
                title: "Ban Failed!",
                text: "Could not ban user",
                icon: "error",
                timer: 2000,
                background: '#6d6d6d',
                color: '#ffffff'
            });
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <Modal show={show} onClose={onClose}>
            <Modal.Header>Ban User: {username}</Modal.Header>
            <Modal.Body>
                <div className="space-y-4">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Ban Duration
                        </label>
                        <Select value={duration} onChange={(e) => setDuration(e.target.value)}>
                            <option value="1h">1 Hour</option>
                            <option value="24h">24 Hours</option>
                            <option value="1w">1 Week</option>
                            <option value="permanent">Permanent</option>
                        </Select>
                    </div>
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Reason
                        </label>
                        <TextInput
                            placeholder="Enter ban reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
            </Modal.Body>
            <Modal.Footer>
                <Button gradientMonochrome="failure" onClick={handleBanUser} disabled={isProcessing}>
                    {isProcessing ? "Banning..." : "Confirm Ban"}
                </Button>
                <Button color="gray" onClick={onClose}>
                    Cancel
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default BanUserModal;
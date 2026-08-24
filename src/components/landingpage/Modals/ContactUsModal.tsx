"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import ModalCloseIcon from "@/assets/icons/ModalCloseIcon";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { showToast } from "@/components/common/Toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactUsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

const ContactUsModal = ({ isOpen, onClose }: ContactUsModalProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isValid = name.trim().length > 0 && EMAIL_REGEX.test(email.trim()) && message.trim().length > 0;

    const resetForm = () => {
        setName("");
        setEmail("");
        setMessage("");
    };

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (!isValid || isSubmitting) return;
        setIsSubmitting(true);
        try {
            await POST_API(endpoints.contact.create, {
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
            });
            showToast({
                type: "success",
                message: "Thanks for reaching out! We'll get back to you soon.",
            });
            resetForm();
            onClose();
        } catch (err: any) {
            showToast({
                type: "error",
                message: err?.data?.detail || "Something went wrong. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            className="max-w-[90%] h-full top-0 flex-center"
            classNames={{ content: "!rounded-3xl !p-6" }}
            closable={false}
            footer={false}
        >
            <div className="w-full md:w-[450px]">
                <div className="flex justify-between items-center">
                    <span className="text-xl font-medium">Contact Us</span>
                    <ModalCloseIcon
                        onClick={handleClose}
                        width={35}
                        height={35}
                        className="cursor-pointer rounded-full hover:shadow-lg"
                    />
                </div>
                <div className="mt-5 flex flex-col gap-4">
                    <Input
                        name="name"
                        label="Your Name"
                        inputType="text"
                        value={name}
                        onChange={(value) => setName(value as string)}
                        placeholder="Enter your name"
                    />
                    <Input
                        name="email"
                        label="Your Email"
                        inputType="text"
                        value={email}
                        onChange={(value) => setEmail(value as string)}
                        placeholder="Enter your email"
                    />
                    <Input
                        name="message"
                        label="Message"
                        inputType="textarea"
                        value={message}
                        onChange={(value) => setMessage(value)}
                        placeholder="How can we help?"
                        rows={4}
                    />
                    <Button
                        title="Send Message"
                        className="!bg-black w-full !px-3 !py-2 !text-white hover:!bg-black hover:!text-white text-sm !rounded-xl"
                        loading={isSubmitting}
                        disabled={!isValid}
                        onClick={handleSubmit}
                    />
                </div>
            </div>
        </Modal>
    );
};

export default ContactUsModal;

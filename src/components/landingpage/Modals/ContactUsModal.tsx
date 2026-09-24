"use client";

import React, { useState } from "react";
import { Modal } from "antd";
import ModalCloseIcon from "@/assets/icons/ModalCloseIcon";
import Button from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { POST_API } from "@/api/request";
import { endpoints } from "@/api/constants";
import { showToast } from "@/components/common/Toast";
import { IoCheckmarkCircle } from "react-icons/io5";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ContactUsModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

type FieldErrors = { name?: string; email?: string; message?: string };

const validate = (values: { name: string; email: string; message: string }): FieldErrors => {
    const errors: FieldErrors = {};
    if (!values.name.trim()) errors.name = "Name is required";
    if (!values.email.trim()) errors.email = "Email is required";
    else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = "Enter a valid email address";
    if (!values.message.trim()) errors.message = "Message is required";
    return errors;
};

const ContactUsModal = ({ isOpen, onClose }: ContactUsModalProps) => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [message, setMessage] = useState("");
    const [errors, setErrors] = useState<FieldErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const resetForm = () => {
        setName("");
        setEmail("");
        setMessage("");
        setErrors({});
        setIsSubmitted(false);
    };

    const handleClose = () => {
        if (isSubmitting) return;
        resetForm();
        onClose();
    };

    const handleSubmit = async () => {
        if (isSubmitting) return;
        const fieldErrors = validate({ name, email, message });
        setErrors(fieldErrors);
        if (Object.keys(fieldErrors).length > 0) return;

        setIsSubmitting(true);
        try {
            await POST_API(endpoints.contact.create, {
                name: name.trim(),
                email: email.trim(),
                message: message.trim(),
            });
            setIsSubmitted(true);
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
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={handleClose}
                        className="focus-ring appearance-none border-0 bg-transparent p-0 leading-none"
                    >
                        <ModalCloseIcon
                            width={35}
                            height={35}
                            className="cursor-pointer rounded-full hover:shadow-lg"
                        />
                    </button>
                </div>
                {isSubmitted ? (
                    <div
                        role="status"
                        aria-live="polite"
                        className="mt-5 flex flex-col items-center text-center gap-3 py-6"
                    >
                        <IoCheckmarkCircle className="text-5xl text-success" aria-hidden="true" />
                        <p className="text-lg font-medium">Message sent</p>
                        <p className="text-sm text-gray-500">
                            Thanks for reaching out! We&apos;ll get back to you soon.
                        </p>
                        <Button
                            title="Close"
                            className="!bg-black !px-6 !py-2 !text-white hover:!bg-black hover:!text-white text-sm !rounded-xl mt-2 focus-ring"
                            onClick={handleClose}
                        />
                    </div>
                ) : (
                    <div className="mt-5 flex flex-col gap-4">
                        <Input
                            name="name"
                            label="Your Name"
                            inputType="text"
                            value={name}
                            error={errors.name}
                            onChange={(value) => {
                                setName(value as string);
                                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                            }}
                            placeholder="Enter your name"
                        />
                        <Input
                            name="email"
                            label="Your Email"
                            inputType="text"
                            value={email}
                            error={errors.email}
                            onChange={(value) => {
                                setEmail(value as string);
                                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                            }}
                            placeholder="Enter your email"
                        />
                        <Input
                            name="message"
                            label="Message"
                            inputType="textarea"
                            value={message}
                            error={errors.message}
                            onChange={(value) => {
                                setMessage(value);
                                if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                            }}
                            placeholder="How can we help?"
                            rows={4}
                        />
                        <Button
                            title="Send Message"
                            className="!bg-black w-full !px-3 !py-2 !text-white hover:!bg-black hover:!text-white text-sm !rounded-xl focus-ring"
                            loading={isSubmitting}
                            onClick={handleSubmit}
                        />
                    </div>
                )}
            </div>
        </Modal>
    );
};

export default ContactUsModal;

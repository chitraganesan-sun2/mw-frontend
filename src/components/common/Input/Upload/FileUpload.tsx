import Button from "../../Button";

interface FileUploadProps extends BaseUploaderProps {
    uploadProgress?: number;
    errorMessage?: string;
}

const FileUpload = ({ ...props }: FileUploadProps) => {
    const { handleClick, handleRemove, value = null, isLoading = false, uploadProgress, errorMessage } = props;

    const getTitle = () => {
        if (props.fileType === "image/*") {
            return "Upload Image";
        } else if (props.fileType === "video/*") {
            return "Upload Video";
        } else if (props.fileType === "application/*,image/*") {
            return "Upload Document";
        }
        return "Upload Document";
    };

    const getMaxSize = () => {
        if (props.fileType === "video/*") return "Max: 100MB";
        if (props.fileType === "image/*") return "Max: 10MB";
        return "Max: 25MB";
    };

    const getValue = () => {
        if (props.fileType === "image/*") {
            return value?.image_id && value?.image_id + ".jpg";
        } else if (props.fileType === "video/*") {
            return value?.video_id;
        } else if (props.fileType === "application/*,image/*") {
            return value?.document_id;
        }
        return null;
    };

    return (
        <div className="flex w-full flex-col gap-2">
            <div className="flex w-full flex-wrap gap-4">
                {!getValue() ? (
                    <div className="flex flex-col gap-1">
                        <Button
                            size="small"
                            title={getTitle()}
                            btnVariant="secondary"
                            customClassName="!text-xs !text-white !border-black rounded-lg !bg-black"
                            onClick={handleClick}
                            loading={isLoading}
                        />
                        <span className="text-[10px] text-gray-400">{getMaxSize()}</span>
                    </div>
                ) : (
                    <div className="flex items-center flex-row-reverse gap-2 text-xs">{getValue()}</div>
                )}
                {getValue() && (
                    <div className="flex items-center flex-row-reverse gap-2">
                        <Button
                            size="small"
                            title="Change"
                            btnVariant="secondary"
                            customClassName="!text-xs !text-black !border-black !bg-white"
                            onClick={handleClick}
                            loading={isLoading}
                        />
                        <Button
                            size="small"
                            title="Remove"
                            btnVariant="secondary"
                            customClassName="!text-xs !bg-white !border !border-error !text-red-500"
                            onClick={() => handleRemove(0, props.fileType)}
                            loading={false}
                        />
                    </div>
                )}
            </div>

            {/* Upload Progress Bar */}
            {isLoading && uploadProgress !== undefined && uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full">
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                            className="bg-blue-600 h-1.5 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${uploadProgress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-gray-500 mt-0.5">
                        Uploading... {uploadProgress}%
                    </p>
                </div>
            )}

            {/* Error Message */}
            {errorMessage && (
                <p className="text-xs text-red-500 mt-0.5">{errorMessage}</p>
            )}
        </div>
    );
};

export default FileUpload;

import Button from "@/components/common/Button";
import { Table as AntTable } from "antd";
import {} from "nuqs";

interface Learner {
    id: string;
    name: string;
    classesTaken: number;
    subject: string;
    chat_permission: boolean;
}

interface Props {
    data: Learner[];
    isLoading?: boolean;
    handleMessageLearner: (learnerId: string) => void;
}

interface LearnersTableProps {
    data: TableLearner[];
    handleMessageLearner: (id: string) => void;
    loading?: boolean;
    pagination?: any;
    onChange?: (pagination: any) => void;
    chatPermission?: boolean;
}

const LearnersTable: React.FC<LearnersTableProps> = ({
    data,
    handleMessageLearner,
    loading,
    pagination,
    onChange,
    chatPermission,
}) => {
    const columns = [
        {
            title: "Learner Name",
            dataIndex: "name",
            key: "name",
            sorter: (a: any, b: any) => a?.name?.localeCompare(b?.name),
            className: "!pl-7 px-6 py-4 text-sm w-1/3 font-medium text-gray-900",
        },
        {
            title: "Classes Taken",
            dataIndex: "classesTaken",
            key: "classesTaken",
            sorter: (a: any, b: any) => a?.classesTaken - b?.classesTaken,
            className: "!pl-7 px-6 py-4 text-sm w-1/4 bg-gray-50 text-gray-900",
        },
        {
            title: "Actions",
            key: "actions",
            render: (_: any, record: Learner) => (
                <div className="flex items-center gap-2">
                    <Button
                        disabled={!record.chat_permission}
                        onClick={() => handleMessageLearner(record.id)}
                        btnVariant="link"
                        title="Message Learner"
                        className={`${
                            !record.chat_permission ? "!text-gray-400" : "!text-primary"
                        }`}
                    />
                </div>
            ),
            className: "px-6 py-4",
        },
    ];

    return (
        <div className="w-full overflow-hidden h-full ">
            <AntTable
                className="!capitalize"
                dataSource={data}
                columns={columns as any}
                loading={loading}
                pagination={pagination}
                onChange={onChange}
                rowKey="id"
                showSorterTooltip={false}
                sticky
                scroll={{ x: "max-content" }}
            />
        </div>
    );
};

export default LearnersTable;

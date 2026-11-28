import { sectionsData } from "./data";

export default function PrivacyPolicySections() {
    return (
        <div className="flex flex-col gap-5">
            {sectionsData.map((section, index) => (
                <div key={index} className="flex flex-col gap-3">
                    <h3 className="text-lg font-bold">
                        {index + 1}. {section.title}
                    </h3>
                    <div className="flex flex-col gap-3 pl-5">
                        {renderSection(section.content, `section-${index}`)}
                    </div>
                </div>
            ))}
        </div>
    );
};

const renderTable = (content: any, key: string = "root") => (
    <div key={key} className="overflow-auto">
        <table className="min-w-full border border-gray-800 text-sm text-left">
            <thead className="bg-gray-600">
                <tr>
                    {content.headers.map((header: string, idx: number) => (
                        <th
                            key={`${key}-header-${idx}`}
                            className="border p-4 font-semibold text-white text-center"
                        >
                            {header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {content.rows.map((row: string[], rowIndex: number) => (
                    <tr
                        key={`${key}-row-${rowIndex}`}
                        className="odd:bg-white even:bg-gray-100"
                    >
                        {row.map((cell, cellIndex) => (
                            <td
                                key={`${key}-cell-${rowIndex}-${cellIndex}`}
                                className="border px-4 py-2 text-gray-700 text-center"
                                dangerouslySetInnerHTML={{
                                    __html: typeof cell === "string" ? cell : ""
                                }}
                            />
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
)

const renderSection = (item: any, key: string = "root"): React.ReactNode => {
    if (typeof item === "string") {
        return (
            <p
                key={key}
                className="text-base text-justify text-gray-700 break-words"
                dangerouslySetInnerHTML={{ __html: item }}
            />
        );
    }

    if (Array.isArray(item)) {
        return item.map((subItem: any, idx: number) =>
            renderSection(subItem, `${key}-${idx}`)
        );
    }

    if (typeof item === "object") {
        const {
            title,
            content,
            contextType = "text",
            hideNumber = false
        } = item;

        // ✅ Handle table
        if (contextType === "table" && content?.headers && content?.rows) {
            return renderTable(content, key);
        }

        const isList = contextType === "list" || contextType === "combined";

        return (
            <div key={key} className="flex flex-col gap-3">
                {title && <h4 className="text-base font-semibold">{title}</h4>}

                {isList ? (
                    <ol
                        className={`pl-4 md:pl-10 flex flex-col gap-1 ${hideNumber ? "list-none pl-3 md:pl-5" : "list-decimal list-outside"
                            }`}
                    >
                        {Array.isArray(content) &&
                            content.map((subItem, idx) => {
                                const isNestedList =
                                    typeof subItem === "object" && subItem?.contextType === "list";
                                return isNestedList ? (
                                    <li key={`${key}-${idx}`}>
                                        {subItem?.title && (
                                            <h6 className="text-base font-medium">{subItem.title}</h6>
                                        )}
                                        <ol
                                            className={`pl-4 md:pl-10 flex flex-col gap-1 ${subItem?.hideNumber ? "!list-none pl-3 md:pl-5" : "list-[lower-alpha] list-outside"}`}
                                        >
                                            {renderSection(subItem.content, `${key}-${idx}-nested`)}
                                        </ol>
                                    </li>
                                ) : (
                                    <li
                                        key={`${key}-${idx}`}
                                        className="text-base text-justify text-gray-700 break-words"
                                        dangerouslySetInnerHTML={{
                                            __html: typeof subItem === "string" ? subItem : ""
                                        }}
                                    />
                                );
                            })}
                    </ol>
                ) : (
                    <div className="flex flex-col gap-2 pl-3 md:pl-5">
                        {renderSection(content, `${key}-child`)}
                    </div>
                )}
            </div>
        );
    }

    return null;
};

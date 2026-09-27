import { Modal } from 'antd';
import React, { useEffect, useState } from 'react'
import { Spin } from "antd";

function ModalLoader({ isLoading, title }: { isLoading: boolean, title?: string }) {
  // antd's Modal renders via a Portal, which only exists client-side ("Portal only
  // work in client side" - antd's own SSR warning) - so it structurally can't match
  // whatever the server rendered, causing a hydration mismatch on every page that
  // shows this loader while isLoading is already true on first render. Rendering
  // nothing until mount keeps the first client render identical to the server's.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (!mounted) return null;

  return (
    <Modal
        open={isLoading}
        footer={null}
        closable={false}
        centered
        zIndex={2000}
        classNames={{ content: "!bg-transparent !shadow-none" }}
    >
        <div className="w-full h-full flex-center flex-col gap-4">
            <Spin size="large" className="[&_.ant-spin-dot-item]:!bg-white" />
            <p className="text-white text-lg font-medium">{title}</p>
        </div>
    </Modal>
  )
}

export default ModalLoader;
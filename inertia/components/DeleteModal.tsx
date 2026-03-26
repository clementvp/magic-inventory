import { Button, Modal, Space } from 'antd'

interface DeleteModalProps {
  open: boolean
  itemName: string
  entityLabel: string
  confirmText?: string
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DeleteModal({
  open,
  itemName,
  entityLabel,
  confirmText = 'Supprimer',
  loading = false,
  onConfirm,
  onCancel,
}: DeleteModalProps) {
  return (
    <Modal
      open={open}
      title={`Supprimer ${entityLabel} ?`}
      onCancel={onCancel}
      centered
      width={420}
      footer={
        <Space>
          <Button onClick={onCancel} disabled={loading}>
            Annuler
          </Button>
          <Button danger type="primary" loading={loading} onClick={onConfirm}>
            {confirmText}
          </Button>
        </Space>
      }
    >
      <p style={{ margin: '16px 0' }}>
        Vous allez supprimer <strong>«&#160;{itemName}&#160;»</strong>.<br />
        Cette action est irréversible.
      </p>
    </Modal>
  )
}

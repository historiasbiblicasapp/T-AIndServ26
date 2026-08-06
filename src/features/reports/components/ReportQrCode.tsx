import QRCode from 'qrcode'
import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'

interface ReportQrCodeProps {
  value: string
  title?: string
}

export default function ReportQrCode({ value, title }: ReportQrCodeProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('')

  useEffect(() => {
    if (value) {
      QRCode.toDataURL(value, { width: 200, margin: 2 }).then(setQrDataUrl).catch(() => {})
    }
  }, [value])

  if (!qrDataUrl) return null

  return (
    <Card className="w-fit">
      {title && (
        <CardContent className="pb-0 pt-4">
          <p className="text-sm font-medium text-center">{title}</p>
        </CardContent>
      )}
      <CardContent className="flex items-center justify-center p-4">
        <img src={qrDataUrl} alt="QR Code" className="h-48 w-48" />
      </CardContent>
    </Card>
  )
}

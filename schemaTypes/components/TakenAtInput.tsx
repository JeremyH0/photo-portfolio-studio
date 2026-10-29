import {Button, Flex, Stack, Text} from '@sanity/ui'
import {useEffect, useRef, useState} from 'react'
import {set, useClient, useFormValue, type StringInputProps} from 'sanity'

/** EXIF DateTimeOriginal ("2025:11:17 16:43:48" or ISO) as YYYY-MM-DD. */
function toDate(raw: unknown): string | null {
  const m = typeof raw === 'string' ? raw.match(/^(\d{4})[:-](\d{2})[:-](\d{2})/) : null
  return m && m[1] !== '0000' ? `${m[1]}-${m[2]}-${m[3]}` : null
}

const pretty = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

/**
 * "Date taken": filled in from the photo's camera info as soon as an image
 * is added (the image field extracts EXIF on upload), and always editable.
 * Fills only once per image, so clearing it on purpose sticks.
 */
export function TakenAtInput(props: StringInputProps) {
  const {value, onChange, readOnly, renderDefault} = props
  const assetRef = useFormValue(['image', 'asset', '_ref']) as string | undefined
  const client = useClient({apiVersion: '2026-07-01'})
  // undefined = still looking, null = this file has no camera date.
  const [cameraDate, setCameraDate] = useState<string | null | undefined>()
  const filledFor = useRef<string | undefined>(undefined)

  useEffect(() => {
    setCameraDate(undefined)
    if (!assetRef) return
    let alive = true
    let timer: ReturnType<typeof setTimeout> | undefined
    // A just-uploaded asset can take a moment to become readable: retry a
    // few times before concluding the file has no camera date.
    const look = (triesLeft: number) =>
      client
        .fetch('*[_id == $id][0]{"date": metadata.exif.DateTimeOriginal}', {id: assetRef})
        .then((asset: {date?: unknown} | null) => {
          if (!alive) return
          if (!asset && triesLeft > 0) timer = setTimeout(() => look(triesLeft - 1), 1000)
          else setCameraDate(toDate(asset?.date))
        })
        .catch(() => alive && setCameraDate(null))
    look(4)
    return () => {
      alive = false
      clearTimeout(timer)
    }
  }, [assetRef, client])

  useEffect(() => {
    if (!assetRef || !cameraDate || readOnly || filledFor.current === assetRef) return
    filledFor.current = assetRef
    if (!value) onChange(set(cameraDate))
  }, [assetRef, cameraDate, readOnly, value, onChange])

  let note: string | null = null
  let offerCamera = false
  if (assetRef && cameraDate === null && !value) {
    note = 'This photo has no camera date. Pick the day it was taken, if you know it.'
  } else if (cameraDate && value === cameraDate) {
    note = 'Filled in from the camera.'
  } else if (cameraDate) {
    note = `The camera says ${pretty(cameraDate)}.`
    offerCamera = !readOnly
  }

  return (
    <Stack space={3}>
      {renderDefault(props)}
      {note && (
        <Flex align="center" gap={3} wrap="wrap">
          <Text size={1} muted>
            {note}
          </Text>
          {offerCamera && cameraDate && (
            <Button
              mode="ghost"
              fontSize={1}
              padding={2}
              text="Use that date"
              onClick={() => onChange(set(cameraDate))}
            />
          )}
        </Flex>
      )}
    </Stack>
  )
}

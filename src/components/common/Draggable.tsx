import React, {
  FC,
  MouseEventHandler,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

interface DraggableData extends DraggableState {
  node: HTMLElement | Element
}

type DraggableEvent = React.MouseEvent | MouseEvent

type DraggableEventHandler = (
  e: DraggableEvent,
  data: DraggableData
) => void | false

interface Props {
  children: React.ReactElement
  handle?: string | string[]
  disabled?: boolean
  onDrag?: DraggableEventHandler
  onStart?: DraggableEventHandler
  onEnd?: DraggableEventHandler
  defaultPosition?: Position
  defaultOffset?: Position
}

interface Position {
  x: number
  y: number
}

const nullCoordinates: Position = {
  x: 0,
  y: 0,
}

const createDraggableData = (
  data: DraggableState,
  target: HTMLElement
): DraggableData => ({
  ...data,
  node: target,
})

interface DraggableState {
  position: Position
  offset: Position
  dragging: boolean
  style?: Object
}

function computeStyle(position: Position, oldStyle: Object = {}): Object {
  return {
    ...oldStyle,
    transform: `translate(${position.x}px, ${position.y}px)`,
  }
}

function isHandle(target: Element, handle?: string | string[]): boolean {
  if (typeof handle === 'undefined') return false

  let parent: Element | HTMLElement | null = target

  do {
    if (typeof handle === 'string' && parent.matches(handle)) {
      return true
    }
    if (handle instanceof Array && handle.some((el) => parent?.matches(el))) {
      return true
    }
    parent = parent.parentElement
  } while (parent)

  return false
}

const Draggable: FC<Props> = ({
  children,
  handle,
  disabled = false,
  defaultPosition = nullCoordinates,
  defaultOffset,
  onStart,
  onDrag,
  onEnd,
}) => {
  const [draggableState, setDraggableState] = useState<DraggableState>({
    position: defaultPosition,
    offset: nullCoordinates,
    dragging: false,
    style: computeStyle(defaultPosition),
  })

  const ref = useRef<HTMLDivElement>(null)

  const onMouseDownHandler: MouseEventHandler = useCallback(
    (e) => {
      if (
        !!ref.current &&
        (disabled || isHandle(e.target as Element, handle))
      ) {
        const style = getComputedStyle(ref.current)
        const rect = ref.current.getBoundingClientRect()
        const offset = {
          x: e.clientX - rect.left + Number(style.marginLeft.slice(0, -2)),
          y: e.clientY - rect.top + Number(style.marginTop.slice(0, -2)),
        }

        if (callUserHandler(e, onStart)) return

        setDraggableState((prevState) => ({
          ...prevState,
          offset: defaultOffset || offset,
          dragging: true,
        }))
      }
    },
    [draggableState]
  )

  const onMouseUpHandler: MouseEventHandler = useCallback(
    (e) => {
      if (callUserHandler(e, onEnd)) return
      if (!draggableState.dragging) return
      setDraggableState((prevState) => ({
        ...prevState,
        dragging: false,
      }))
    },
    [draggableState]
  )

  const onMouseMoveHandler = useCallback(
    (e: MouseEvent) => {
      if (callUserHandler(e, onDrag)) return
      if (draggableState.dragging) {
        const position = {
          x: e.clientX - draggableState.offset.x,
          y: Math.max(e.clientY - draggableState.offset.y, 0),
        }

        const style = computeStyle(position)

        setDraggableState((prevState) => ({
          ...prevState,
          position: position,
          style: style,
        }))
      }
    },
    [draggableState]
  )

  const callUserHandler = (
    e: DraggableEvent,
    handler?: DraggableEventHandler
  ): boolean => {
    return (
      !!handler &&
      handler(
        e,
        createDraggableData(draggableState, e.target as HTMLElement)
      ) === false
    )
  }

  useEffect(() => {
    addEventListener('mousemove', onMouseMoveHandler)

    return () => {
      window.removeEventListener('mousemove', onMouseMoveHandler)
    }
  }, [draggableState])

  return React.cloneElement(React.Children.only(children), {
    style: { ...children.props.style, ...draggableState.style },
    onMouseDown: onMouseDownHandler,
    onMouseUp: onMouseUpHandler,
    ref: ref,
  })
}

export default Draggable

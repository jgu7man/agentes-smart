export interface DiagramObject {
  id: string,
  props: DiagramProps,
  anchors: string[]
}

export interface DiagramProps {
  bottom: number
  height: number
  left: number
  right: number
  top: number
  width: number
  x: number
  y: number
  center: {
      x: number,
      y: number
  }
}

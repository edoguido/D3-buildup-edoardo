//
// sizes constants

// TODO use @vx/responsive
export const WINDOW_PADDING = 16
export const WIDTH = window.innerWidth - WINDOW_PADDING * 2
export const HEIGHT = window.innerHeight - WINDOW_PADDING * 2
export const MARGIN = {
  top: 120,
  right: 80,
  bottom: 60,
  left: 80,
}
export const INNER_WIDTH = WIDTH - MARGIN.left - MARGIN.right
export const INNER_HEIGHT = HEIGHT - MARGIN.top - MARGIN.bottom
export const CHART_PADDING = 0
export const LEGEND_WIDTH = 0
export const Y_AXIS_WIDTH = 0

//
// texts
export const FONT_SIZE = 12
export const LINE_HEIGHT = 1
export const MAX_STRING_LENGTH = 32
//
// bottom axis
export const X_AXIS_LABEL_PADDING = 0

export let CHART_AREA_WIDTH = INNER_WIDTH - Y_AXIS_WIDTH - LEGEND_WIDTH * 2
export let CHART_AREA_HEIGHT = INNER_HEIGHT - X_AXIS_LABEL_PADDING

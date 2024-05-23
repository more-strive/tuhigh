import { Point, classRegistry, TPointerEvent, util, IText } from 'fabric'
import { VerticalTextMixin } from '@/extension/mixins/verticaltext.mixin'

interface CursorOffsetCache {
  left: number
  top: number
}

const LATIN_CHARS_REGX = /[a-zA-Z\.\s]+/;
const NUMBERIC_REGX = /[0-9]/;
const BRACKETS_REGX = /[\(\)\]\[\{\}\]]/;
const BRACKETS = /[ー「」『』（）〔〕［］｛｝｟｠〈〉《》【】〖〗〘〙〚〛゛゜。、・゠＝〜…•‥◦﹅﹆]/;

export class VerticalText extends IText {
  static type: string = 'VerticalText';
  public minHeight: number
  private __isMousedown: boolean = false

  constructor(text: string, options: any) {
    super(text, options)
    this.textAlign = 'right'
    this.direction = 'rtl'
    this.minHeight = options.width

    this.offsets = {
      underline: 0.05,
      linethrough: 0.65,
      overline: 1.10
    };
  }

  initDimensions() {
    super.initDimensions();

    if (this.height < this.minHeight) {
      this._set('height', this.minHeight);
    }
  }

  get type() {
    return 'VerticalText'
  }

  _renderTextCommon(ctx: CanvasRenderingContext2D, method: 'fillText' | 'strokeText') {
    ctx.save();
    let lineHeights = 0, left = this._getLeftOffset(), top = this._getTopOffset();
    for (let i = 0, len = this._textLines.length; i < len; i++) {

      !this.__charBounds[i] && this.measureLine(i);

      this._renderTextLine(
        method,
        ctx,
        this._textLines[i],
        left - lineHeights,
        top + this._getLineLeftOffset(i),
        i
      );
      lineHeights += this.getHeightOfLine(i);
    }
    ctx.restore();
  }

  _renderCJKChar(method: 'fillText' | 'strokeText', ctx: CanvasRenderingContext2D, lineIndex: number, charIndex: number, left: number, top: number) {
    let charbox = this.__charBounds[lineIndex][charIndex],
      char = this._textLines[lineIndex][charIndex],
      localLineHeight = this.getHeightOfLine(lineIndex),
      charLeft = left - (localLineHeight / this.lineHeight - charbox.width) / 2,
      charTop = top + charbox.top + charbox.height - this.lineHeight,
      isLtr = this.direction === 'ltr';
    ctx.save();
    ctx.canvas.setAttribute('dir', isLtr ? 'ltr' : 'rtl');
    ctx.direction = isLtr ? 'ltr' : 'rtl';
    ctx.textAlign = isLtr ? 'left' : 'right';

    if (BRACKETS.test(char)) {
      charTop += this.lineHeight * this._fontSizeMult;
      charLeft -= this.lineHeight * this._fontSizeMult;
      const tx = charLeft - charbox.width / 2, ty = charTop - charbox.height / 2; 
      ctx.translate(tx, ty);
      ctx.rotate(-Math.PI / 2);
      ctx.translate(-tx, -ty);
    }

    this._renderChar(method, ctx, lineIndex, charIndex, char, charLeft, charTop);
    ctx.restore();
  }

  _renderAlphanumeric(method: 'fillText' | 'strokeText', ctx: CanvasRenderingContext2D, lineIndex: number, startIndex: number, endIndex: number, left: number, top: number) {
    let charBox = this.__charBounds[lineIndex][startIndex],
      chars = '',
      drawWidth = 0,
      localLineHeight = this.getHeightOfLine(lineIndex),
      drawLeft = left,
      drawTop = top + charBox.top + charBox.height;

    for (let i = startIndex; i <= endIndex; i++) {
      chars += this._textLines[lineIndex][i];
      drawWidth += this.__charBounds[lineIndex][i].width;
    }
    const widthFactor = (drawWidth + localLineHeight / this.lineHeight);
    const heightFactor = drawWidth / 2 - charBox.height;
    drawLeft = drawLeft - widthFactor / 2;
    drawTop = drawTop + heightFactor;
    ctx.save();
    ctx.direction = 'ltr'
    ctx.textAlign = 'start'
    const _boxHeight = charBox.height;
    const tx = drawLeft + drawWidth / 2 - _boxHeight / 8, ty = drawTop - _boxHeight / 8;
    ctx.translate(tx, ty);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-tx, -ty);
    this._renderChar(method, ctx, lineIndex, startIndex, chars, drawLeft, drawTop);
    ctx.restore();
  }

  _renderChars(method: 'fillText' | 'strokeText', ctx: CanvasRenderingContext2D, line: Array<any>, left: number, top: number, lineIndex: number) {
    let timeToRender, startChar = null, actualStyle, nextStyle, endChar = null;
    ctx.save();
    for (let i = 0, len = line.length - 1; i <= len; i++) {
      if (this._isLatin(line[i])) {
        timeToRender = (i === len || !this._isLatin(line[i + 1]));
        if (startChar === null && this._isLatin(line[i])) {
          startChar = i;
        };
        if (!timeToRender) {
          actualStyle = actualStyle || this.getCompleteStyleDeclaration(lineIndex, i);
          nextStyle = this.getCompleteStyleDeclaration(lineIndex, i + 1);
          timeToRender = this._hasStyleChanged(actualStyle, nextStyle);
        }

        if (timeToRender) {
          endChar = i;
          this._renderAlphanumeric(method, ctx, lineIndex, startChar as number, endChar, left, top);
          timeToRender = false;
          startChar = null;
          endChar = null;
          actualStyle = nextStyle;
        }
      } 
      else {
        this._renderCJKChar(method, ctx, lineIndex, i, left, top);
      }
    }
    ctx.restore();
  }

  _hasStyleChanged(prevStyle: any, thisStyle: any) {
    if(Object.keys(prevStyle).length !== Object.keys(thisStyle).length ){
      return true
    }
    for(let prop in prevStyle){
      if(prevStyle[prop] !== thisStyle[prop]){
        return true;
      }
    }
    return false;
  }

  _isLatin(char: string) {
    return LATIN_CHARS_REGX.test(char) || BRACKETS_REGX.test(char) || NUMBERIC_REGX.test(char);
  }

  calcTextWidth() {
    return super.calcTextHeight()
  }

  calcTextHeight() {
    let longestLine = 0,
      currentLineHeight = 0,
      char,
      charBox,
      space = 0;

    if (this.charSpacing !== 0) {
      space = this._getWidthOfCharSpacing();
    }
    for (let lineIndex = 0, len = this._textLines.length; lineIndex < len; lineIndex++) {
      !this.__charBounds[lineIndex] && this._measureLine(lineIndex);

      currentLineHeight = 0;
      for (let charIndex = 0, rlen = this._textLines[lineIndex].length; charIndex < rlen; charIndex++) {
        char = this._textLines[lineIndex][charIndex];
        charBox = this.__charBounds[lineIndex][charIndex];
        if (char) {
          if (this._isLatin(char)) {
            currentLineHeight += charBox.width + space;
          } else {
            currentLineHeight += charBox.height + space;
          }
        }
      }
      if (currentLineHeight > longestLine) {
        longestLine = currentLineHeight;
      }
    }
    return longestLine + this.cursorWidth;
  }

  getSelectionStartFromPointer(e: TPointerEvent) {
    let mouseOffset = this.getLocalPointer(e),
      prevHeight = 0,
      width = 0,
      height = 0,
      charIndex = 0,
      lineIndex = 0,
      charBox,
      lineHeight = 0,
      space = 0,
      line;

    if (this.charSpacing !== 0) {
      space = this._getWidthOfCharSpacing();
    }
    mouseOffset.x = this.width * this.scaleX - mouseOffset.x + width;
    for (let i = 0, len = this._textLines.length; i < len; i++) {
      if (width <= mouseOffset.x) {
        lineHeight = this.getHeightOfLine(i) * this.scaleY;
        width += lineHeight;
        lineIndex = i;
        if (i > 0) {
          charIndex += this._textLines[i - 1].length + this.missingNewlineOffset(i - 1);
        }
      }
      else {
        break;
      }
    }
    line = this._textLines[lineIndex];
    const charLen = line.length
    for (let j = 0; j < charLen; j++) {
      prevHeight = height;
      charBox = this.__charBounds[lineIndex][j];
      if (this._isLatin(this._textLines[lineIndex][j])) {
        height += charBox.width * this.scaleY + space;
      } else {
        height += charBox.height * this.scaleY + space;
      }
      if (height <= mouseOffset.y) {
        charIndex++;
      }
      else {
        break;
      }
    }

    return this._getNewSelectionStartFromOffset(mouseOffset as Point, prevHeight, height, charIndex, charLen);
  }

  _getNewSelectionStartFromOffset(mouseOffset: Point, prevHeight: number, height: number, index: number, charLen: number) {
    let distanceBtwLastCharAndCursor = mouseOffset.y - prevHeight,
      distanceBtwNextCharAndCursor = height - mouseOffset.y,
      offset = distanceBtwNextCharAndCursor > distanceBtwLastCharAndCursor ||
        distanceBtwNextCharAndCursor < 0 ? 0 : 1,
      newSelectionStart = index + offset;
    if (this.flipX) {
      newSelectionStart = charLen - newSelectionStart;
    }

    if (newSelectionStart > this._text.length) {
      newSelectionStart = this._text.length;
    }

    return newSelectionStart;
  }

  _getCursorBoundariesOffsets(position: number, skipCaching?: boolean): CursorOffsetCache {
    if (this.cursorOffsetCache && 'top' in this.cursorOffsetCache) {
      return this.cursorOffsetCache as CursorOffsetCache;
    }
    let lineLeftOffset,
      lineIndex,
      charIndex,
      topOffset = 0,
      leftOffset = 0,
      boundaries,
      charBox,
      cursorPosition = this.get2DCursorLocation(position);
    charIndex = cursorPosition.charIndex;
    lineIndex = cursorPosition.lineIndex;
    for (let i = 0; i < lineIndex; i++) {
      leftOffset += this.getHeightOfLine(i);
    }

    for (let i = 0; i < charIndex; i++) {
      charBox = this.__charBounds[lineIndex][i];
      if (this._isLatin(this._textLines[lineIndex][i])) {
        topOffset += charBox.width;
      } else {
        topOffset += charBox.height;
      }
    }

    lineLeftOffset = this._getLineLeftOffset(lineIndex);
    // bound && (leftOffset = bound.left);
    if (this.charSpacing !== 0 && charIndex === this._textLines[lineIndex].length) {
      leftOffset -= this._getWidthOfCharSpacing();
    }
    boundaries = {
      top: lineLeftOffset + (topOffset > 0 ? topOffset : 0),
      left: leftOffset,
    };
    if (this.direction === 'rtl') {
      boundaries.left *= -1;
    }
    this.cursorOffsetCache = boundaries;
    return this.cursorOffsetCache as CursorOffsetCache
  }

  _getGraphemeBox(grapheme: string, lineIndex: number, charIndex: number, prevGrapheme: string, skipLeft?: boolean) {
    let box = super._getGraphemeBox(grapheme, lineIndex, charIndex, prevGrapheme, skipLeft) as any;
    box.top = 0;
    box.height = Number(box.height)

    if (charIndex > 0 && !skipLeft) {
      const previousBox = this.__charBounds[lineIndex][charIndex - 1];
      const isAlphaNumeric = this._isLatin(this._textLines[lineIndex][charIndex - 1]);
      box.top = previousBox.top + previousBox[isAlphaNumeric ? 'width' : 'height'];
    }
    return box;
  }

  renderSelection(ctx: CanvasRenderingContext2D, boundaries: any) {
    let selectionStart = this.inCompositionMode ? this.hiddenTextarea?.selectionStart : this.selectionStart,
      selectionEnd = this.inCompositionMode ? this.hiddenTextarea?.selectionEnd : this.selectionEnd,
      isJustify = this.textAlign.indexOf('justify') !== -1,
      start = this.get2DCursorLocation(selectionStart),
      end = this.get2DCursorLocation(selectionEnd),
      startLine = start.lineIndex,
      endLine = end.lineIndex,
      startChar = start.charIndex < 0 ? 0 : start.charIndex,
      endChar = end.charIndex < 0 ? 0 : end.charIndex;
    for (let i = startLine; i <= endLine; i++) {
      let lineHeight = this.getHeightOfLine(i), boxStart = 0, boxEnd = 0;

      if (i === startLine) {
        boxStart = this.__charBounds[startLine][startChar].top;
      }
      if (i >= startLine && i < endLine) {
        boxEnd = isJustify && !this.isEndOfWrapping(i) ? this.height : this.getLineWidth(i) || 5;
      }
      else if (i === endLine) {
        if (endChar === 0) {
          boxEnd = this.__charBounds[endLine][endChar].top;
        }
        else {
          let charSpacing = this._getWidthOfCharSpacing();
          const prevCharBox = this.__charBounds[endLine][endChar - 1];
          boxEnd = prevCharBox.top - charSpacing;
          if (this._isLatin(this._textLines[endLine][endChar - 1])) {
            boxEnd += prevCharBox.width;
          } else {
            boxEnd += prevCharBox.height;
          }
        }
      }

      let drawStart = boundaries.left - boundaries.leftOffset,
        drawWidth = lineHeight,
        drawHeight = boxEnd - boxStart;

      if (this.lineHeight < 1 || (i === endLine && this.lineHeight > 1)) {
        drawWidth /= this.lineHeight;
      }
      if (this.inCompositionMode) {
        ctx.fillStyle = this.compositionColor || 'black';
      }
      else {
        ctx.fillStyle = this.selectionColor;
      }
      if (this.direction === 'rtl') {
        drawStart = this.width - drawStart - drawWidth;
      }
      ctx.fillRect(
        drawStart,
        boundaries.top + boxStart,
        drawWidth,
        drawHeight,
      );
      boundaries.leftOffset -= lineHeight;
    }
  }

  renderCursor(ctx: CanvasRenderingContext2D, boundaries: any) {
    let cursorLocation = this.get2DCursorLocation(),
      lineIndex = cursorLocation.lineIndex,
      charIndex = cursorLocation.charIndex > 0 ? cursorLocation.charIndex - 1 : 0,
      charBox = this.__charBounds[lineIndex][charIndex],
      charHeight = this.getValueOfPropertyAt(lineIndex, charIndex, 'fontSize'),
      multiplier = this.scaleX * this.canvas!.getZoom(),
      cursorWidth = this.cursorWidth / multiplier,
      topOffset = boundaries.topOffset,
      lineHeight = this.getHeightOfLine(lineIndex),
      drawStart = boundaries.left - boundaries.leftOffset + (lineHeight / this.lineHeight + charBox.height) / 2;

    if (this.inCompositionMode) {
      this.renderSelection(ctx, boundaries);
    }
    if (this.direction === 'rtl') {
      drawStart = this.width - drawStart;
    }
    ctx.fillStyle = this.cursorColor || this.getValueOfPropertyAt(lineIndex, charIndex, 'fill');
    ctx.globalAlpha = this.__isMousedown ? 1 : this._currentCursorOpacity;
    ctx.fillRect(drawStart, topOffset + boundaries.top, charHeight, cursorWidth);
  }


  _renderTextLinesBackground(ctx: CanvasRenderingContext2D) {
    if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor')) {
      return;
    }
    let heightOfLine,
      originalFill = ctx.fillStyle,
      line, lastColor,
      leftOffset = this.width - this._getLeftOffset(),
      lineTopOffset = this._getTopOffset(),
      charBox, currentColor, path = this.path,
      boxHeight = 0,
      left = 0,
      top = null,
      char;

    for (let i = 0, len = this._textLines.length; i < len; i++) {
      heightOfLine = this.getHeightOfLine(i);
      left += heightOfLine;
      if (!this.textBackgroundColor && !this.styleHas('textBackgroundColor', i)) {
        continue;
      }
      line = this._textLines[i];
      boxHeight = 0;
      lastColor = this.getValueOfPropertyAt(i, 0, 'textBackgroundColor');
      top = this.__charBounds[i][0].top;
      for (let j = 0, charLen = line.length; j < charLen; j++) {
        char = line[j];
        charBox = this.__charBounds[i][j];
        currentColor = this.getValueOfPropertyAt(i, j, 'textBackgroundColor');

        if (currentColor !== lastColor) {
          ctx.fillStyle = lastColor;
          if (lastColor) {
            ctx.fillRect(
              leftOffset - left + heightOfLine - (heightOfLine / this.lineHeight),
              lineTopOffset + top,
              heightOfLine / this.lineHeight,
              boxHeight
            )
          }

          if (this._isLatin(char)) {
            boxHeight = charBox.width;
          } else {
            boxHeight = charBox.height;
          }
          lastColor = currentColor;
          top = charBox.top;
        }
        else {
          if (this._isLatin(char)) {
            boxHeight += charBox.kernedWidth;
          } else {
            boxHeight += charBox.height;
          }
        }
      }
      if (currentColor && !path) {
        ctx.fillStyle = currentColor;
        ctx.fillRect(
          leftOffset - left + heightOfLine - (heightOfLine / this.lineHeight),
          lineTopOffset + top,
          heightOfLine / this.lineHeight,
          boxHeight
        );
      }

    }
    ctx.fillStyle = originalFill;
    this._removeShadow(ctx);
  }

  getLocalPointer(e: TPointerEvent, pointer?: Point) {
    pointer = pointer || this.canvas!.getPointer(e);
    let pClicked = new Point(pointer.x, pointer.y)
    const objectLeftTop = this._getLeftTopCoords();
    if (this.angle) {
      pClicked = util.rotatePoint(pClicked, objectLeftTop, util.degreesToRadians(-this.angle));
    }
    return {
      x: pClicked.x - objectLeftTop.x,
      y: pClicked.y - objectLeftTop.y
    };
  }

  _renderTextDecoration(ctx: CanvasRenderingContext2D, type: any) {
    if (!this.get(type) && !this.styleHas(type)) return
    let heightOfLine, size, _size = 0,
      dy, _dy,
      left = 0,
      top = 0,
      boxHeight = 0,
      char = '',
      line, lastDecoration,
      leftOffset = this.width - this._getLeftOffset(),
      topOffset = this._getTopOffset(),
      boxWidth, charBox, currentDecoration,
      currentFill, lastFill,
      //@ts-ignore
      offsetY = this.offsets[type];

    for (let i = 0, len = this._textLines.length; i < len; i++) {
      heightOfLine = this.getHeightOfLine(i);
      left += heightOfLine;
      if (!this.get(type) && !this.styleHas(type, i)) { continue; }

      boxHeight = 0;
      line = this._textLines[i];
      boxWidth = 0;
      lastDecoration = this.getValueOfPropertyAt(i, 0, type);
      lastFill = this.getValueOfPropertyAt(i, 0, 'fill');
      top = this.__charBounds[i][0].top + this.lineHeight;

      size = heightOfLine / this.lineHeight;
      dy = this.getValueOfPropertyAt(i, 0, 'deltaY');
      for (let j = 0, charLen = line.length; j < charLen; j++) {
        charBox = this.__charBounds[i][j];
        char = line[j];
        currentDecoration = this.getValueOfPropertyAt(i, j, type);
        currentFill = this.getValueOfPropertyAt(i, j, 'fill');
        _size = this.getHeightOfChar(i, j);
        _dy = this.getValueOfPropertyAt(i, j, 'deltaY');

        (!lastDecoration) && (top = charBox.top);

        if (
          (currentDecoration !== lastDecoration || currentFill !== lastFill || _size !== size || _dy !== dy)
          && boxWidth > 0
        ) {
          if (lastDecoration && lastFill) {
            ctx.fillStyle = lastFill;
            ctx.fillRect(
              leftOffset - left + heightOfLine - _size * offsetY,
              topOffset + top,
              this.fontSize / 15,
              boxHeight,
            );
          }
          boxWidth = charBox.width;
          if (this._isLatin(char)) {
            boxHeight = charBox.width;
          } else {
            boxHeight = charBox.height;
          }
          lastDecoration = currentDecoration;
          lastFill = currentFill;
          size = _size;
          dy = _dy;
          top = charBox.top;
        }
        else {
          if (this._isLatin(char)) {
            boxHeight += charBox.kernedWidth;
          } else {
            boxHeight += charBox.height;
          }
          boxWidth += charBox.kernedWidth;
        }
      }
      ctx.fillStyle = currentFill;
      if (currentDecoration && currentFill) {
        ctx.fillRect(
          leftOffset - left + heightOfLine - _size * offsetY,
          topOffset + top,
          this.fontSize / 15,
          boxHeight,
        );
      }
    }
    // if there is text background color no
    // other shadows should be casted
    this._removeShadow(ctx);
  }
}

Object.assign(VerticalText.prototype, { ...VerticalTextMixin })

classRegistry.setClass(VerticalText, 'VerticalText')
/**
 * BLE delivers a reading in notifications of ~20 bytes, so one line may arrive in pieces
 * and one piece may carry the end of a line and the start of the next. The assembler
 * buffers text and emits complete lines, cut at the profile's terminator.
 */
export class LineAssembler {
  /** A reader never sends a line this long; past it the buffer is noise and is dropped. */
  static readonly MAX_BUFFER = 256;

  private buffer = '';

  constructor(
    private readonly terminator: string,
    private readonly onOverflow?: (discarded: string) => void,
  ) {
    if (terminator === '') {
      throw new Error('El terminador de línea no puede estar vacío');
    }
  }

  push(chunk: string): string[] {
    this.buffer += chunk;
    const lines: string[] = [];
    let index = this.buffer.indexOf(this.terminator);

    while (index !== -1) {
      const line = this.buffer.slice(0, index);
      this.buffer = this.buffer.slice(index + this.terminator.length);
      if (line.trim() !== '') {
        lines.push(line);
      }
      index = this.buffer.indexOf(this.terminator);
    }

    if (this.buffer.length > LineAssembler.MAX_BUFFER) {
      this.onOverflow?.(this.buffer);
      this.buffer = '';
    }

    return lines;
  }

  /** A reconnection starts clean: half a line from before the drop can never be completed. */
  reset(): void {
    this.buffer = '';
  }
}

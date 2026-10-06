import { LineAssembler } from '../readers/LineAssembler';

describe('LineAssembler', () => {
  it('emits a line that arrives whole', () => {
    expect(new LineAssembler('\r\n').push('032000000000001\r\n')).toEqual(['032000000000001']);
  });

  it('joins a line that arrives in three pieces', () => {
    const a = new LineAssembler('\r\n');
    expect(a.push('032000')).toEqual([]);
    expect(a.push('0000000')).toEqual([]);
    expect(a.push('01\r\n')).toEqual(['032000000000001']);
  });

  it('splits two lines that arrive in one piece and keeps the remainder', () => {
    const a = new LineAssembler('\r\n');
    expect(a.push('032000000000001\r\n032000000000002\r\n0320')).toEqual(['032000000000001', '032000000000002']);
    expect(a.push('00000000003\r\n')).toEqual(['032000000000003']);
  });

  it('handles a terminator cut between two pieces', () => {
    const a = new LineAssembler('\r\n');
    expect(a.push('032000000000001\r')).toEqual([]);
    expect(a.push('\n')).toEqual(['032000000000001']);
  });

  it.each(['\r', '\n'])('works with the single terminator %j', (terminator) => {
    expect(new LineAssembler(terminator).push(`LA 032 000000000001${terminator}`)).toEqual(['LA 032 000000000001']);
  });

  it('ignores empty lines', () => {
    expect(new LineAssembler('\r\n').push('\r\n\r\n032000000000001\r\n')).toEqual(['032000000000001']);
  });

  it('drops a buffer that grows past the limit without a terminator', () => {
    const overflow = jest.fn();
    const a = new LineAssembler('\r\n', overflow);
    a.push('x'.repeat(LineAssembler.MAX_BUFFER + 1));
    expect(overflow).toHaveBeenCalledTimes(1);
    expect(a.push('032000000000001\r\n')).toEqual(['032000000000001']);
  });

  it('starts clean after a reset', () => {
    const a = new LineAssembler('\r\n');
    a.push('0320000');
    a.reset();
    expect(a.push('032000000000002\r\n')).toEqual(['032000000000002']);
  });
});

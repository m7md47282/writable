import { NextResponse } from 'next/server';

export class ResponseUtils {
  static success<T>(data: T, status: number = 200) {
    return NextResponse.json({
      success: true,
      data
    }, { status });
  }

  static error(message: string, status: number = 400) {
    return NextResponse.json({
      success: false,
      error: message
    }, { status });
  }

  static validationError(errors: string[]) {
    return NextResponse.json({
      success: false,
      error: 'Validation failed',
      details: errors
    }, { status: 400 });
  }

  static unauthorized(message: string = 'Unauthorized') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 401 });
  }

  static forbidden(message: string = 'Forbidden') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 403 });
  }

  static notFound(message: string = 'Not found') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 404 });
  }

  static serverError(message: string = 'Internal server error') {
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
}

import connectToDB from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { Types } from 'mongoose';

import User from '@/lib/models/user';
import Category from '@/lib/models/category';
import Blog from '@/lib/models/blog';

export const GET = async (request: NextRequest, context: { params: any }) => {
  try {
    const blogId = context.params.blogId;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const categoryId = searchParams.get('categoryId');

    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog id invalid or is missing' })
      );
    }

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: 'User id invalid or is missing' }),
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Category id invalid or is missing' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'User not found in the database' }),
        { status: 404 }
      );
    }

    const category = await Category.findById(categoryId);

    if (!category) {
      return new NextResponse(
        JSON.stringify({ message: 'Category not found in the database' }),
        { status: 404 }
      );
    }

    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
      category: categoryId,
    });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog not found in the database' }),
        { status: 404 }
      );
    }

    return new NextResponse(JSON.stringify({ message: 'Found blog', blog }), {
      status: 200,
    });
  } catch (error: any) {
    return new NextResponse('Error fetching a blog ' + error.message, {
      status: 500,
    });
  }
};

// complete patch
export const PATCH = async (request: NextRequest, context: { params: any }) => {
  try {
    const blogId = context.params.blogId;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    const body = await request.json();
    const { title, description } = body;

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: 'User id missing or invalid' }),
        { status: 400 }
      );
    }

    if (!blogId || !Types.ObjectId.isValid(blogId)) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog id missing or invalid' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'User not found in database' }),
        { status: 400 }
      );
    }

    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
    });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog not found in database' }),
        { status: 400 }
      );
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      { title, description },
      { new: true }
    );

    return new NextResponse(JSON.stringify({ updatedBlog }), { status: 200 });
  } catch (e) {
    const error = e as Error;
    return (
      new NextResponse('Error in updating blog ' + error.message),
      { status: 500 }
    );
  }
};

// complete delete
export const DELETE = async (
  request: NextRequest,
  context: { params: any }
) => {
  try {
    const blogId = context.params.blogId;

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId || !Types.ObjectId.isValid(userId)) {
      return new NextResponse(
        JSON.stringify({ message: 'User id missing or invalid' }),
        { status: 400 }
      );
    }

    await connectToDB();

    const user = await User.findById(userId);

    if (!user) {
      return new NextResponse(
        JSON.stringify({ message: 'User not found in database' }),
        { status: 400 }
      );
    }

    const blog = await Blog.findOne({
      _id: blogId,
      user: userId,
    });

    if (!blog) {
      return new NextResponse(
        JSON.stringify({ message: 'Blog not found in database' }),
        { status: 400 }
      );
    }

    await Blog.findByIdAndDelete(blogId);

    return new NextResponse(
      JSON.stringify({ message: 'Blog successfully deleted' }),
      { status: 200 }
    );
  } catch (error: any) {
    return (
      new NextResponse('Error in updating blog ' + error.message),
      { status: 500 }
    );
  }
};

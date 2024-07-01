import CommentType from './CommentType'

export default interface PostType {
  postId: string; 
  username: string;
  postedTime: any;
  type: string;
  title: string;
  body: string;
  numComments: number;
  numReposts: number;
  votes: number;
  hasImage: boolean;
  hasTempImage: boolean;
  isUpvoted: boolean;
  isDownvoted: boolean;
  postedTimeAgo: string; // Add this line
  comments: CommentType[]
  image: string | null
  profileImage: string | null
  hasTempProfileImage: boolean
}

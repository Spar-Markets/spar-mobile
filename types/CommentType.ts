export default interface CommentType {
    postId: string; 
    commentId: string;
    username: string;
    uid: string;
    postedTime: Date;
    body: string;
    votes: number,
    isUpvoted: boolean,
    isDownvoted: boolean,
    postedTimeAgo: string
    replies: CommentType[]
  }
  
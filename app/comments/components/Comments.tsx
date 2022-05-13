import Confirm from "app/core/components/Confirm"
import Form from "app/core/components/Form"
import LabeledTextField from "app/core/components/LabeledTextField"
import { invalidateQuery, useMutation, useQuery } from "blitz"
import moment, { invalid } from "moment"
import { useState } from "react"
import toast from "react-hot-toast"
import addComment from "../mutations/addComment"
import deleteComment from "../mutations/deleteComment"
import editComment from "../mutations/editComment"
import getCandidateStageComments from "../queries/getCandidateStageComments"
import getChildComments from "../queries/getChildComments"

const Comments = ({ user, selectedWorkflowStage, candidate }) => {
  const [showNewText, setShowNewText] = useState(false)
  const [commentText, setCommentText] = useState("")
  const [addCommentMutation] = useMutation(addComment)
  const [comments] = useQuery(getCandidateStageComments, {
    candidateId: candidate?.id,
    workflowStageId: selectedWorkflowStage?.id,
  })

  return (
    <>
      <div className="m-6">
        <div className="flex items-center">
          <div className="font-bold text-lg w-full">Comments</div>
          <button
            className="disabled:opacity-50 disabled:cursor-not-allowed flex-end text-white bg-theme-600 px-4 py-2 rounded-sm hover:bg-theme-700"
            onClick={() => {
              setShowNewText(true)
              setCommentText("")
            }}
          >
            New
          </button>
        </div>
        {showNewText && (
          <div className="mt-2 w-full">
            <Form
              name="newCommentForm"
              noFormatting={true}
              onSubmit={async () => {
                if (!commentText) {
                  toast.error("Please enter a comment")
                  return
                }

                const toastId = toast.loading("Adding comment")
                try {
                  await addCommentMutation({
                    text: commentText,
                    candidateId: candidate?.id,
                    workflowStageId: selectedWorkflowStage?.id,
                  })
                  invalidateQuery(getCandidateStageComments)
                  toast.success("Comment added", { id: toastId })
                } catch (error) {
                  toast.error(`Adding comment failed - ${error.toString()}`, { id: toastId })
                }
                setShowNewText(false)
                setCommentText("")
              }}
            >
              <LabeledTextField
                name="newComment"
                autoFocus={true}
                placeholder="Add a new comment"
                onChange={(e) => {
                  setCommentText(e.target.value)
                }}
              />
              <div className="flex w-full justify-end space-x-3 flex-nowrap">
                <button
                  type="button"
                  className="text-sm text-theme-500 underline mt-1"
                  onClick={() => {
                    setShowNewText(false)
                    setCommentText("")
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="text-sm text-theme-500 underline mt-1">
                  Submit
                </button>
              </div>
            </Form>
          </div>
        )}
        <div className="w-full mt-3 flex flex-col space-y-3">
          {comments?.length === 0 && <p>No comments added</p>}
          <CommentsList
            key="parentCommentsList"
            user={user}
            candidate={candidate}
            comments={comments}
            selectedWorkflowStage={selectedWorkflowStage}
          />
        </div>
      </div>
    </>
  )
}

type CommentsListProps = {
  user: any
  candidate: any
  selectedWorkflowStage: any
  comments: any
  isChild?: boolean
}
const CommentsList = ({
  user,
  candidate,
  selectedWorkflowStage,
  comments,
  isChild,
}: CommentsListProps) => {
  return (
    <>
      {comments?.map((comment) => {
        return (
          <div key={comment.id} className={`${isChild ? "pl-2 mt-1" : ""}`}>
            <CommentWithChildren
              comment={comment}
              candidate={candidate}
              selectedWorkflowStage={selectedWorkflowStage}
              user={user}
            />
          </div>
        )
      })}
    </>
  )
}

type CommentWithChildrenProps = {
  comment: any
  user: any
  candidate: any
  selectedWorkflowStage: any
}
const CommentWithChildren = ({
  comment,
  user,
  candidate,
  selectedWorkflowStage,
}: CommentWithChildrenProps) => {
  const [replyCommentText, setReplyCommentText] = useState("")
  const [showReplyCommentId, setShowReplyCommentId] = useState("0")
  const [editCommentText, setEditCommentText] = useState("")
  const [showEditCommentId, setShowEditCommentId] = useState("0")
  const [deleteCommentId, setDeleteCommentId] = useState("0")
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [addCommentMutation] = useMutation(addComment)
  const [editCommentMutation] = useMutation(editComment)
  const [deleteCommentMutation] = useMutation(deleteComment)
  const [childComments] = useQuery(getChildComments, comment?.id)

  return (
    <>
      <Confirm
        open={openDeleteConfirm}
        setOpen={setOpenDeleteConfirm}
        header="Delete Comment"
        onSuccess={async () => {
          if (!deleteCommentId) {
            toast.error("No commentId set for deleting")
            return
          }
          const toastId = toast.loading("Deleting comment")
          try {
            await deleteCommentMutation({
              commentId: comment.id,
            })
            invalidateQuery(getCandidateStageComments)
            invalidateQuery(getChildComments)
            toast.success("Comment deleted", { id: toastId })
          } catch (error) {
            toast.error(`Failed to delete comment - ${error.toString()}`, {
              id: toastId,
            })
          }
          setDeleteCommentId("0")
          setOpenDeleteConfirm(false)
        }}
      >
        Are you sure you want to delete the comment & all its replies?
      </Confirm>
      <div className="border-l-2 border-neutral-300 pl-2">
        <div className="whitespace-nowrap">
          <span className="capitalize text-sm font-semibold whitespace-nowrap">
            {moment(comment.createdAt).local().fromNow()}
          </span>{" "}
          by{" "}
          <span className="capitalize text-sm font-semibold whitespace-nowrap">
            {comment.creatorId === user?.id ? "You" : comment.creator?.name}
          </span>
          {user.id === comment.creatorId && (
            <>
              {" "}
              •{" "}
              <button
                type="button"
                className="text-sm text-theme-500 underline hover:text-theme-700"
                onClick={() => {
                  setShowEditCommentId(comment.id)
                  setEditCommentText("")
                }}
              >
                Edit
              </button>{" "}
              •{" "}
              <button
                type="button"
                className="text-sm text-theme-500 underline hover:text-theme-700"
                onClick={() => {
                  setDeleteCommentId(comment.id)
                  setOpenDeleteConfirm(true)
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>
        {showEditCommentId !== comment.id && <div className="italic">{comment.text}</div>}
        {showEditCommentId === comment.id && (
          <div className="mt-1">
            <Form
              name={`editCommentForm-${comment.id}`}
              noFormatting={true}
              onSubmit={async () => {
                if (!editCommentText) {
                  toast.error("Comment can't be empty")
                  return
                }
                const toastId = toast.loading("Editing comment")
                try {
                  await editCommentMutation({
                    commentId: comment.id,
                    editText: editCommentText,
                  })
                  invalidateQuery(getCandidateStageComments)
                  invalidateQuery(getChildComments)
                  toast.success("Comment edited", { id: toastId })
                } catch (error) {
                  toast.error(`Failed to edit comment - ${error.toString()}`, {
                    id: toastId,
                  })
                }
                setShowEditCommentId("0")
                setEditCommentText("")
              }}
            >
              <LabeledTextField
                name={`editComment-${comment.id}`}
                autoFocus={true}
                placeholder="Edit comment"
                defaultValue={comment.text}
                onChange={(e) => {
                  setEditCommentText(e.target.value)
                }}
              />
              <div className="flex w-full justify-end space-x-3 flex-nowrap">
                <button
                  type="button"
                  className="text-sm text-theme-500 underline mt-1"
                  onClick={() => {
                    setShowEditCommentId("0")
                    setEditCommentText("")
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="text-sm text-theme-500 underline mt-1">
                  Submit
                </button>
              </div>
            </Form>
          </div>
        )}
        {showReplyCommentId !== comment.id && (
          <button
            type="button"
            className="text-sm text-theme-500 underline hover:text-theme-700 mt-1 mr-3"
            onClick={() => {
              setShowReplyCommentId(comment.id)
              setReplyCommentText("")
            }}
          >
            Reply
          </button>
        )}
        {showReplyCommentId === comment.id && (
          <div className="mt-1">
            <Form
              name={`replyCommentForm-${comment.id}`}
              noFormatting={true}
              onSubmit={async () => {
                if (!replyCommentText) {
                  toast.error("Please enter your reply")
                  return
                }

                const toastId = toast.loading("Adding reply")
                try {
                  await addCommentMutation({
                    text: replyCommentText,
                    candidateId: candidate?.id,
                    workflowStageId: selectedWorkflowStage?.id,
                    parentCommentId: comment.id,
                  })
                  invalidateQuery(getCandidateStageComments)
                  invalidateQuery(getChildComments)
                  toast.success("Reply added", { id: toastId })
                } catch (error) {
                  toast.error(`Adding reply failed - ${error.toString()}`, {
                    id: toastId,
                  })
                }
                setShowReplyCommentId("0")
                setReplyCommentText("")
              }}
            >
              <LabeledTextField
                name={`replyComment-${comment.id}`}
                autoFocus={true}
                placeholder="Your reply goes here"
                onChange={(e) => {
                  setReplyCommentText(e.target.value)
                }}
              />
              <div className="flex w-full justify-end space-x-3 flex-nowrap">
                <button
                  type="button"
                  className="text-sm text-theme-500 underline mt-1"
                  onClick={() => {
                    setShowReplyCommentId("0")
                    setReplyCommentText("")
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="text-sm text-theme-500 underline mt-1">
                  Submit
                </button>
              </div>
            </Form>
          </div>
        )}
        {childComments && (
          <CommentsList
            key={`childCommentsListForParent-${comment.id}`}
            comments={childComments}
            user={user}
            candidate={candidate}
            selectedWorkflowStage={selectedWorkflowStage}
            isChild={true}
          />
        )}
      </div>
    </>
  )
}

export default Comments

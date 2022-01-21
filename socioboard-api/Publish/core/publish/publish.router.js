import Router from 'express';
import PublishController from './publish.controller.js';

const router = Router();

router.post(
  '/publishPosts',
  PublishController.publishPostMiddleware.bind(PublishController),
  PublishController.publishPost
);
router.get('/get-drafted-posts', PublishController.getDraftedPosts);
router.get('/get-draft-post-by-id', PublishController.getDraftPostById);
router.put('/update-draft-post-by-id', PublishController.updateDraftPostById);
router.delete(
  '/delete-draft-post-by-id',
  PublishController.deleteDraftPostById
);
router.get('/get-approval-postStatus', PublishController.getApprovalPostStatus);
router.get('/get-approval-post-by-id', PublishController.getApprovalPostById);
router.delete(
  '/delete-approval-post-by-id',
  PublishController.deleteApprovalPostById
);
router.get('/get-published-posts', PublishController.getPublishedPosts);
router.post('/filter-published-posts', PublishController.filterPublishedPosts);
export default router;

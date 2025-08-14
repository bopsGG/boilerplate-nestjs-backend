export enum ApprovalStatusEnum {
  'APPROVE' = 'APPROVE',
  'REJECT' = 'REJECT',
  'PENDING' = 'PENDING',
}

export const ApprovalStatusLabel: Record<ApprovalStatusEnum, string> = {
  [ApprovalStatusEnum.APPROVE]: 'อนุมัติ',
  [ApprovalStatusEnum.REJECT]: 'ไม่อนุมัติ',
  [ApprovalStatusEnum.PENDING]: 'รอดำเนินการ',
};

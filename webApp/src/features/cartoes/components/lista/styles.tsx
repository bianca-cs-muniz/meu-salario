import { Box, css, styled } from '@mui/material';

const grade = css`
  display: grid;
  gap: 16px;
`;

export const Grade = styled(Box)`
  ${grade}

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

export const Itens = styled('ul')`
  ${grade}

  ${({ theme }) => theme.breakpoints.up('tablet')} {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

import { css } from 'emotion'
import { mobileMaxWidth } from 'constants/css'

export const contentPage = css`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
  > section {
    width: 65%;
    @media (max-width: ${mobileMaxWidth}) {
      width: 100%;
    }
  }
`

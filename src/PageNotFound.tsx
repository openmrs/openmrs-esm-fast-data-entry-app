import React, { FC } from 'react'
import { useNavigate } from 'react-router-dom'
type Props = {}

export const PageNotFound: FC = () => {

  const navigate = useNavigate()
  return (
    <div>
      <div>Error 404, Page not found</div>
      <div onClick={() => navigate(-1)}>Go back</div>
      </div>
  )
}

import * as React from 'react'
import styled from 'styled-components'
import { Modal } from 'react-overlays'
import { StyledBox } from './design-system'

export const MyModal = props => {
  return (
    <Modal
      {...props}
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        zIndex: 1000,
        ...props.style
      }}
      backdropStyle={{
        position: 'absolute',
        top: 0,
        right: 0,
        left: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        ...props.backdropStyle
      }}
    >
      {props.children}
    </Modal>
  )
}

const MyModalWindow = props => {
  const { children, title, footer, style, ...myModalProps } = props
  return (
    <MyModal {...myModalProps}>
      <StyledBox
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          maxWidth: '100%',
          boxSizing: 'border-box',
          backgroundColor: 'white',
          display: 'flex',
          flexDirection: 'column',
          ...style
        }}
      >
        <header
          style={{
            flex: '0 0 auto',
            padding: '12px',
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#eee',
            textTransform: 'uppercase'
          }}
        >
          <h1 style={{ margin: '0 8px 0 0', padding: 0 }}>{title}</h1>
        </header>
        <div
          style={{
            flex: '1 1 auto',
            overflow: 'auto',
            height: '100%',
            padding: `${!title ? '12px' : 0} 12px ${!footer ? '12px' : 0}`
          }}
        >
          {children}
        </div>
        {footer && (
          <footer
            style={{
              flex: '0 0 auto',
              padding: '12px',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#eee',
              textTransform: 'uppercase'
            }}
          >
            footer
          </footer>
        )}
      </StyledBox>
    </MyModal>
  )
}

export default MyModalWindow

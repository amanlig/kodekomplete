import { Box, Stack, Typography } from '@mui/material'


import { CardData, CardEnterEvent, CardEvent, CardSwiper } from 'react-card-swiper'

const Content = () => (
  <Typography px={2} variant="h6">
    Lorem ipsum dolor sit amet.
  </Typography>
)

const mockData: CardData[] = [
  { id: '88552078', meta: { apk: 'some-apk-a.apk' }, src: "", content: <Content /> },
  { id: 'fc7e0bd4', meta: { apk: 'some-apk-b.apk' }, src: "", content: <Content /> },
  { id: 'da9a7067', meta: { apk: 'some-apk-c.apk' }, src: "", content: <Content /> },
]

export default function SwipeSelectionPage() {
  const handleDismiss: CardEvent = (el, meta, id, action, operation) => {
    console.log({ el, meta, id, action, operation }) // event data to be handled
  }

  const handleFinish = (status: string) => {
    console.log(status) // 'finished'
  }

  const handleEnter: CardEnterEvent = (el, meta, id) => {
    console.log(el, meta, id)
  }

  return (
    <Stack height={'100%'} width={'100%'} direction="column" alignItems="center" justifyContent={'end'} p={2}>
      <CardSwiper
        data={mockData}
        onEnter={handleEnter}
        onFinish={handleFinish}
        onDismiss={handleDismiss}
        dislikeButton={<div>Left</div>}
        likeButton={<div>Right</div>}
        withActionButtons
        withRibbons
        likeRibbonText="INSTALL"
        dislikeRibbonText="PASS"
        ribbonColors={{ bgLike: 'green', bgDislike: 'red', textColor: 'white' }}
        emptyState={
          <Stack direction={'column'} alignItems={'center'} justifyContent={'center'} textAlign={'center'} gap={2}>
            <Box component={'img'} width={250} src="" />
            <Typography variant={'subtitle2'}>
              You've reached the <br /> end of the list
            </Typography>
          </Stack>
        }
      />
    </Stack>
  )
}
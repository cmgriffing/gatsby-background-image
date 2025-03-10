import { render } from '@testing-library/react'
import '@testing-library/react/cleanup-after-each'
import React from 'react'
import { fixedShapeMock, fluidShapeMock } from './mocks/Various.mock'
import {
  noscriptImg,
  inImageCache,
  activateCacheForImage,
  resetImageCache,
  createPictureRef,
  switchImageSettings,
  imagePropsChanged,
  activatePictureRef,
  getCurrentFromData,
  getUrlString,
  imageReferenceCompleted,
  imageLoaded,
  initialBgImage,
  imageArrayPropsChanged,
} from '../ImageUtils'

global.console.debug = jest.fn()

afterEach(resetImageCache)

const fixedMock = {
  fixed: fixedShapeMock,
}

const fluidMock = {
  fluid: fluidShapeMock,
}

const fixedArrayMock = {
  fixed: [fixedShapeMock, fixedShapeMock],
}

const fluidArrayMock = {
  fluid: [fluidShapeMock, fluidShapeMock],
}

describe(`createPictureRef()`, () => {
  it(`should return null on ssr or empty fluid / fixed prop`, () => {
    const emptyImageRef = createPictureRef({})
    expect(emptyImageRef).toBeNull()
  })

  it(`should return null on ssr or empty fluid / fixed prop & wrong type for onLoad`, () => {
    const emptyImageRef = createPictureRef({}, {})
    expect(emptyImageRef).toBeNull()
  })
})

describe(`createPictureRef() with crossOrigin`, () => {
  it(`should set crossOrigin`, () => {
    const emptyImageRef = createPictureRef({
      fluid: fluidShapeMock,
      crossOrigin: `anonymous`,
    })
    expect(emptyImageRef).toMatchInlineSnapshot(`
                                                                                                      <img
                                                                                                        crossorigin="anonymous"
                                                                                                      />
                                                                    `)
  })
})

describe(`createPictureRef() / activatePictureRef() without window`, () => {
  const tmpWindow = global.window
  beforeEach(() => {
    delete global.window
  })
  afterEach(() => {
    global.window = tmpWindow
  })

  it(`should fail without window`, () => {
    const emptyImageRef = createPictureRef({
      fluid: fluidShapeMock,
      critical: true,
    })
    expect(emptyImageRef).toBeNull()
  })

  it(`should fail without window`, () => {
    const testImg = new Image()
    const emptyImageRef = activatePictureRef(testImg, {
      fluid: fluidShapeMock,
      critical: true,
    })
    expect(emptyImageRef).toBeNull()
  })
})

describe(`createPictureRef() with critical image`, () => {
  it(`should preload image on critical`, () => {
    const imageRef = createPictureRef({
      fixed: fixedShapeMock,
      critical: true,
    })
    expect(imageRef).toMatchInlineSnapshot(`
                                                                                                                        <img
                                                                                                                          src="test_fixed_image.jpg"
                                                                                                                          srcset="some srcSet"
                                                                                                                        />
                                                                                `)
  })
  it(`should preload image on isVisible state`, () => {
    const imageRef = createPictureRef({
      fixed: fixedShapeMock,
      isVisible: true,
    })
    expect(imageRef).toMatchInlineSnapshot(`
                                                                                                                        <img
                                                                                                                          src="test_fixed_image.jpg"
                                                                                                                          srcset="some srcSet"
                                                                                                                        />
                                                                                `)
  })
  it(`should set empty strings for image on critical without src & srcSet`, () => {
    const fixedMock = { ...fixedShapeMock }
    fixedMock.src = ``
    fixedMock.srcSet = ``
    const emptyImageRef = createPictureRef({
      fixed: fixedMock,
      critical: true,
    })
    expect(emptyImageRef).toMatchInlineSnapshot(`
                                                                                                <img
                                                                                                  src=""
                                                                                                  srcset=""
                                                                                                />
                                                                `)
  })
})

describe(`createPictureRef() with image array`, () => {
  it(`should return imageRef array with fixed Array Mock`, () => {
    const imageRef = createPictureRef({
      ...fixedArrayMock,
      critical: true,
    })
    expect(imageRef).toMatchInlineSnapshot(`
                                                Array [
                                                  <img
                                                    src="test_fixed_image.jpg"
                                                    srcset="some srcSet"
                                                  />,
                                                  <img
                                                    src="test_fixed_image.jpg"
                                                    srcset="some srcSet"
                                                  />,
                                                ]
                                `)
  })
})

describe(`activatePictureRef() with image array`, () => {
  it(`should return imageRef array with fluid Array Mock`, () => {
    const testImg = new Image()
    const dummyImageRef = activatePictureRef([testImg, testImg], {
      ...fluidArrayMock,
      critical: true,
    })
    expect(dummyImageRef).toMatchSnapshot()
  })

  it(`should return imageRef array with fixed Array Mock`, () => {
    const testImg = new Image()
    const dummyImageRef = activatePictureRef([testImg, testImg], {
      ...fixedArrayMock,
      critical: true,
    })
    expect(dummyImageRef).toMatchSnapshot()
  })
})

describe(`inImageCache() / activateCacheForImage()`, () => {
  it(`should return false for initial load (fixed)`, () => {
    fixedMock.src = `test.jpg`
    const inCache = inImageCache(fixedMock)
    expect(inCache).toBeFalsy()
  })

  it(`shouldn't activate cache without fixed / fluid`, () => {
    activateCacheForImage()
    const inCache = inImageCache()
    expect(inCache).toBeFalsy()
  })

  it(`should return img from cache after activateCacheForImage() (fixed)`, () => {
    activateCacheForImage(fixedMock)
    const inCache = inImageCache(fixedMock)
    expect(inCache).toBeTruthy()
  })

  it(`inImageCache() should return false for initial load (fluid)`, () => {
    const inCache = inImageCache(fluidMock)
    expect(inCache).toBeFalsy()
  })

  it(`should return img from cache after activateCacheForImage() (fluid)`, () => {
    activateCacheForImage(fluidMock)
    const inCache = inImageCache(fluidMock)
    expect(inCache).toBeTruthy()
  })

  it(`should return false without mock`, () => {
    const inCache = inImageCache()
    expect(inCache).toBeFalsy()
  })
})

describe(`inImageCache() / activateCacheForImage() / resetImageCache()`, () => {
  it(`should reset imageCache after caching`, () => {
    activateCacheForImage(fluidMock)
    resetImageCache()
    const inCache = inImageCache(fluidMock)
    expect(inCache).toBeFalsy()
  })
})

// describe(`noscriptImg()`, () => {
//   it(`should return default noscriptImg on {}`, () => {
//     const { container } = render(noscriptImg({}))
//     expect(container).toMatchSnapshot()
//   })
//
//   it(`should return noscriptImg with opacity & transitionDelay & crossOrigin`, () => {
//     const dummyProps = {
//       opacity: 0.99,
//       transitionDelay: 100,
//       crossOrigin: `anonymous`,
//     }
//     const { container } = render(noscriptImg(dummyProps))
//     expect(container).toMatchSnapshot()
//   })
// })

describe(`noscriptImg() / activatePictureRef() without HTMLPictureElement (IE11)`, () => {
  const tmpPicture = HTMLPictureElement
  beforeEach(() => {
    delete global.HTMLPictureElement
  })
  afterEach(() => {
    global.HTMLPictureElement = tmpPicture
  })
  // it(`should return default noscriptImg without <picture /> on {}`, () => {
  //   const { container } = render(noscriptImg({}))
  //   expect(container).toMatchSnapshot()
  // })

  it(`activatePictureRef() should still create an imageRef`, () => {
    const testImg = new Image()
    const dummyImageRef = activatePictureRef(testImg, {
      fluid: fluidShapeMock,
      critical: true,
    })
    expect(dummyImageRef).toMatchSnapshot()
  })
})

describe(`switchImageSettings()`, () => {
  const mockImageRef = {
    src: `http://test.jpg`,
    currentSrc: `http://test.webp`,
    complete: true,
  }
  const state = {
    isVisible: false,
    isLoaded: false,
    imageState: 1,
  }
  it(`should return settings from fluid with empty bgImage`, () => {
    const createdSettings = switchImageSettings({
      image: fluidShapeMock,
      bgImage: ``,
      imageRef: mockImageRef,
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })

  it(`should return settings from fixed with set bgImage`, () => {
    const createdSettings = switchImageSettings({
      image: fixedShapeMock,
      bgImage: `string_of_base64`,
      imageRef: mockImageRef,
      state,
    })
    expect(createdSettings).toMatchSnapshot()
    expect(createdSettings.lastImage).toEqual(`string_of_base64`)
  })

  it(`should return settings from fixed with set bgImage`, () => {
    const createdSettings = switchImageSettings({
      image: fluidShapeMock,
      bgImage: `string_of_base64`,
      imageRef: mockImageRef,
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })

  it(`should return settings from fixed array`, () => {
    state.isVisible = true
    state.imgLoaded = true
    const createdSettings = switchImageSettings({
      image: fluidArrayMock.fluid,
      bgImage: [`string_of_base64`, `imageString`],
      imageRef: [mockImageRef, mockImageRef],
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })

  it(`should return settings from fixed array without currentSrc`, () => {
    const mockImageRefNoCurrentSrc = [{ ...mockImageRef }, { ...mockImageRef }]
    delete mockImageRefNoCurrentSrc[0].currentSrc
    delete mockImageRefNoCurrentSrc[1].currentSrc
    state.isVisible = true
    state.imgLoaded = true
    const createdSettings = switchImageSettings({
      image: fluidArrayMock.fluid,
      imageRef: mockImageRefNoCurrentSrc,
      bgImage: [``, ``],
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })

  it(`should return settings from fluid without src`, () => {
    const fluid = fluidShapeMock
    delete fluid.src
    const mockImageRefNoSrc = { ...mockImageRef }
    delete mockImageRefNoSrc.src
    state.isVisible = true
    state.imgLoaded = true
    const createdSettings = switchImageSettings({
      image: fluid,
      bgImage: ``,
      imageRef: mockImageRefNoSrc,
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })

  it(`should return settings from fluid with set bgImage without base64`, () => {
    const fluid = fluidShapeMock
    delete fluid.base64
    const createdSettings = switchImageSettings({
      image: fluid,
      bgImage: ``,
      imageRef: mockImageRef,
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })

  it(`should return settings from fluid with set bgImage and tracedSVG`, () => {
    const fluid = {
      ...fluidShapeMock,
      tracedSVG: 'test_tracedSVG.svg',
    }
    delete fluid.base64
    const createdSettings = switchImageSettings({
      image: fluid,
      bgImage: `test_tracedSVG.svg`,
      imageRef: mockImageRef,
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })

  it(`should return settings from fluid with set bgImage and base64`, () => {
    const mockRef = mockImageRef
    delete mockRef.src
    state.isVisible = true
    state.isLoaded = true
    const createdSettings = switchImageSettings({
      image: fluidShapeMock,
      bgImage: `string_of_base64`,
      imageRef: mockRef,
      state,
    })
    expect(createdSettings).toMatchSnapshot()
  })
})

describe(`imagePropsChanged()`, () => {
  it(`should return false for same fixed prop`, () => {
    const changedFixed = imagePropsChanged(fixedMock, fixedMock)
    expect(changedFixed).toBeFalsy()
  })

  it(`should return false for same fixed array prop`, () => {
    const changedFixed = imagePropsChanged(fixedArrayMock, fixedArrayMock)
    expect(changedFixed).toBeFalsy()
  })

  it(`should return false for same fluid prop`, () => {
    const changedFluid = imagePropsChanged(fluidMock, fluidMock)
    expect(changedFluid).toBeFalsy()
  })

  it(`should return false for same fluid array prop`, () => {
    const changedFluid = imagePropsChanged(fluidArrayMock, fluidArrayMock)
    expect(changedFluid).toBeFalsy()
  })

  it(`should return true from fluid to fixed`, () => {
    const changedFluidToFixed = imagePropsChanged(fluidMock, fixedMock)
    expect(changedFluidToFixed).toBeTruthy()
  })

  it(`should return true from fluid to fluid array`, () => {
    const changedFluidToFixed = imagePropsChanged(fluidMock, fluidArrayMock)
    expect(changedFluidToFixed).toBeTruthy()
  })

  it(`should return true from fluid array to fluid`, () => {
    const changedFluidToFixed = imagePropsChanged(fluidArrayMock, fluidMock)
    expect(changedFluidToFixed).toBeTruthy()
  })

  it(`should return true from fixed to fluid`, () => {
    const changedFixedToFluid = imagePropsChanged(fixedMock, fluidMock)
    expect(changedFixedToFluid).toBeTruthy()
  })

  it(`should return true from fixed to fixed array`, () => {
    const changedFixedToFluid = imagePropsChanged(fixedMock, fixedArrayMock)
    expect(changedFixedToFluid).toBeTruthy()
  })

  it(`should return true from fixed array to fixed`, () => {
    const changedFixedToFluid = imagePropsChanged(fixedArrayMock, fixedMock)
    expect(changedFixedToFluid).toBeTruthy()
  })

  it(`should return true for different length fluid array prop`, () => {
    const fluidChangedArrayMock = {
      fluid: [...fluidArrayMock.fluid, fluidShapeMock],
    }
    // fluidChangedArrayMock.fluid.push(fluidShapeMock)

    const changedFluid = imagePropsChanged(
      fluidArrayMock,
      fluidChangedArrayMock
    )
    expect(changedFluid).toBeTruthy()
  })

  it(`should return true for different length fluid array prop`, () => {
    const fixedChangedArrayMock = {
      fixed: [...fixedArrayMock.fixed, fluidShapeMock],
    }
    // fluidChangedArrayMock.fluid.push(fluidShapeMock)

    const changedFixed = imagePropsChanged(
      fixedArrayMock,
      fixedChangedArrayMock
    )
    expect(changedFixed).toBeTruthy()
  })

  it(`should return true for fixed arrays with different sources`, () => {
    const secondFixedArrayMock = { ...fixedArrayMock }
    secondFixedArrayMock.fixed = [{ src: `different` }, { src: `different` }]
    const changedFixedToFluid = imagePropsChanged(
      fixedArrayMock,
      secondFixedArrayMock
    )
    expect(changedFixedToFluid).toBeTruthy()
  })

  it(`should return true for fluid arrays with different sources`, () => {
    const secondFluidArrayMock = { ...fluidArrayMock }
    secondFluidArrayMock.fluid = [{ src: `different` }, { src: `different` }]
    const changedFixedToFluid = imagePropsChanged(
      fluidArrayMock,
      secondFluidArrayMock
    )
    expect(changedFixedToFluid).toBeTruthy()
  })
})

describe(`getCurrentFromData() & getUrlString()`, () => {
  it(`getCurrentFromData() should return false for empty data & propName`, () => {
    const returnedString = getCurrentFromData({ data: null, propName: null })
    expect(returnedString).toBeFalsy()
  })

  it(`getCurrentFromData() should return string for data & propName`, () => {
    const returnedString = getCurrentFromData({
      data: [{ blubb: `http://some_image` }],
      propName: `blubb`,
    })
    expect(returnedString).toMatchInlineSnapshot(`"url('http://some_image')"`)
  })

  it(`getCurrentFromData() should return string for data as object & propName`, () => {
    const returnedString = getCurrentFromData({
      data: { blubb: `http://some_image` },
      propName: `blubb`,
    })
    expect(returnedString).toMatchInlineSnapshot(`"url('http://some_image')"`)
  })

  it(`getCurrentFromData() should return empty string for mismatched data as object & propName`, () => {
    const returnedString = getCurrentFromData({
      data: [{ blubb: null }],
      propName: `blubb`,
    })
    expect(returnedString).toMatchInlineSnapshot(`""`)
  })

  it(`getCurrentFromData() should return empty string for mismatched data & propName`, () => {
    const returnedString = getCurrentFromData({
      data: { test: null },
      propName: `blubb`,
    })
    expect(returnedString).toMatchInlineSnapshot(`""`)
  })

  it(`getCurrentFromData() should return string for data & propName tracedSVG`, () => {
    const returnedString = getCurrentFromData({
      data: [{ tracedSVG: `some_SVG` }],
      propName: `tracedSVG`,
    })
    expect(returnedString).toMatchInlineSnapshot(`"url(\\"some_SVG\\")"`)
  })

  it(`getCurrentFromData() should return string for data & propName CSS_STRING`, () => {
    const returnedString = getCurrentFromData({
      data: [`rgba(0,0,0,0.5)`],
      propName: `CSS_STRING`,
      addUrl: false,
    })
    expect(returnedString).toMatchInlineSnapshot(`"rgba(0,0,0,0.5)"`)
  })

  it(`getUrlString() should return  url encapsulated string`, () => {
    const returnedString = getUrlString({ imageString: `blubb` })
    expect(returnedString).toMatchInlineSnapshot(`"url(blubb)"`)
  })

  it(`getUrlString() should return url encapsulated string within array`, () => {
    const returnedString = getUrlString({ imageString: [`blubb`] })
    expect(returnedString).toMatchInlineSnapshot(`"url(blubb)"`)
  })

  it(`getUrlString() should return string without addUrl`, () => {
    const returnedString = getUrlString({ imageString: `blubb`, addUrl: false })
    expect(returnedString).toMatchInlineSnapshot(`"blubb"`)
  })
})

describe(`initialBgImage()`, () => {
  it(`should return initial array without dummies`, () => {
    const initialWithoutDummies = initialBgImage(fluidArrayMock, false)
    expect(initialWithoutDummies).toMatchSnapshot()
  })

  it(`should return initial single tracedSVG`, () => {
    fluidMock.fluid.tracedSVG = `data:image/svg+xml,...`
    const initialTracedSVG = initialBgImage(fluidMock)
    expect(initialTracedSVG).toMatchSnapshot()
  })
})

describe(`imageReferenceCompleted()`, () => {
  it(`should return false with undefined imageRef`, () => {
    expect(imageReferenceCompleted()).toBeFalsy()
  })
})

describe(`imageLoaded()`, () => {
  it(`should return false with undefined imageRef`, () => {
    expect(imageLoaded()).toBeFalsy()
  })
})

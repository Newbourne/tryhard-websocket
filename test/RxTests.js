import tape from 'tape'
import _test from 'tape-promise'
import sinon from 'sinon'
import Rx from 'rxjs/Rx'

const test = _test(tape)

// Convert to use spies
test('Rx Concepts', (t) => {
  /*
    Observable: represents the idea of an invokable collection of future values or events.
  */
  t.test('simple observable with simple observer', (t) => {
    var obs = Rx.Observable.create((o) => {
      o.next()
    })

    var observerSpy = sinon.spy()

    obs.subscribe(observerSpy)

    t.equal(observerSpy.calledOnce, true)

    t.end()
  })

  t.test('simple observable with complete observer', (t) => {
    var obs = Rx.Observable.create((o) => {
      o.next()
      o.complete()
    })

    var nextSpy = sinon.spy()
    var completedSpy = sinon.spy()

    var simpleObserver = {
      next: nextSpy,
      complete: completedSpy
    }

    var subscription = obs.subscribe(simpleObserver)
    setTimeout((sub) => {
      sub.unsubscribe()

      t.equal(nextSpy.calledOnce, true)
      t.equal(completedSpy.calledOnce, true)

      t.end()
    }, 1000, subscription)
  })

  t.test('connectable observerable', (t) => {
    var obs = Rx.Observable.create((o) => {
      o.next()
      o.complete()
    })

    var conn = obs.publish()

    var nextSpy = sinon.spy()
    var completedSpy = sinon.spy()

    conn.subscribe({
      next: nextSpy,
      complete: completedSpy
    })

    setTimeout((o) => {
      conn.connect()

      t.equal(nextSpy.calledOnce, true)
      t.equal(completedSpy.calledOnce, true)

      t.end()
    }, 2000, conn)
  })

  /*
    Subscription: represents the execution of an Observable, is primarily useful for cancelling the execution.
  */
  t.test('subscription', (t) => {
    var subSpy = sinon.spy()

    var subscription = new Rx.Subscription(subSpy)

    subscription.add(subSpy)

    subscription.unsubscribe()

    t.equal(subSpy.calledTwice, true)

    t.end()
  })

  /*
    Subject:
  */
  t.test('simple subject', (t) => {
    var obsSpy = sinon.spy()

    var subject = new Rx.Subject()

    subject.subscribe(obsSpy)

    subject.next('test 1')
    subject.next('test 2')
    subject.next('test 3')

    t.equal(obsSpy.calledThrice, true)

    subject.complete()

    t.end()
  })

  t.test('should confirm subject observerable is only called once', (t) => {
    var obsSpy = sinon.spy()

    var max = 2

    var internalObservable = new Rx.Observable.create((obs) => {
      obsSpy()
      var count = 0
      var interval = setInterval(() => {
        obs.next(count)
        count += 1
        if (count === max) {
          obs.complete()
        }
      }, 1000)
      return () => clearInterval(interval)
    })

    var subject = new Rx.Subject()

    internalObservable.subscribe(subject)

    subject.subscribe(sinon.spy())

    subject.subscribe({
      complete: () => {
        t.equal(obsSpy.calledOnce, true)
        t.end()
      }
    })
  })
})

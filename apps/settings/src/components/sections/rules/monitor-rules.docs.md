# Monitor Rules

Match monitors by name, make, model, or serial to configure display properties.

## Config Syntax

```
monitorrule=name:...,make:...,model:...,serial:...,property:value,...
```

## Matchers

At least one matcher is required. The first matching rule wins.

| Key      | Description           | Example              |
| -------- | --------------------- | -------------------- |
| `name`   | Output name           | `name:DP-1`          |
| `make`   | Monitor manufacturer  | `make:Dell Inc.`     |
| `model`  | Monitor model         | `model:DELL U2723QE` |
| `serial` | Monitor serial number | `serial:ABC123`      |

## Examples

**Primary 4K monitor at 150% scale with VRR:**

```
monitorrule=name:DP-1,scale:1.5,x:0,y:0,vrr:1
```

**Secondary monitor in portrait orientation:**

```
monitorrule=name:HDMI-A-1,rr:1,scale:1.0,x:3840,y:0
```
